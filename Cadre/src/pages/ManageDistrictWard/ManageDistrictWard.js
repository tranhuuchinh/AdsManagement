import { faMagnifyingGlass, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import setLocalStorageFromCookie from '~/src/utils/setLocalStorageFromCookie';
import Modal from '../../components/Modal/Modal';
import useAxiosPrivate from '../../hook/useAxiosPrivate';
import classes from './ManageDistrictWard.module.scss';
import DetailAddress from './components/DetailModal/DetailAddress';
import ModalAdd from './components/ModalAdd';
import ModalUpdate from './components/ModalUpdate';

const ManageDistrictWard = () => {
  const axiosPrivate = useAxiosPrivate();
  const [data, setData] = useState({ districts: [], wards: [] });
  const [originalData, setOriginalData] = useState({ districts: [], wards: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Quận');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalDetail, setIsModalDetail] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLocalStorageFromCookie('user-state');
    setLocalStorageFromCookie('user_type');
    setLocalStorageFromCookie('user_id');
    setLocalStorageFromCookie('token');
  }, []);

  const fetchData = async () => {
    try {
      const responseDistrict = await axiosPrivate.get('/cadre/districts');
      const responseWards = await axiosPrivate.get('/cadre/wards');
      setData({
        districts: responseDistrict.data,
        wards: responseWards.data,
      });
      setOriginalData({
        districts: responseDistrict.data,
        wards: responseWards.data,
      });
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateDataAfterAdd = async (newData) => {
    await fetchData();
    setModalOpen(false);
  };

  const updateDataAfterDetail = async () => {
    setIsModalDetail(false);
    setModalOpen(false);
  };

  const handleFilterChange = (type) => {
    let filteredData;
    if (type === 'Quận') {
      filteredData = originalData.districts;
      setSearchTerm('');
    } else if (type === 'Phường') {
      filteredData = originalData.wards;
      setSearchTerm('');
    }

    setData({
      ...data,
      [type.toLowerCase()]: filteredData,
    });

    setSelectedFilter(type);
  };

  const getFilterStyle = (filter) => ({
    color: selectedFilter === filter ? '#0A6971' : '#2f2f2f',
    borderBottom: selectedFilter === filter ? '2px solid #0A6971' : 'none',
    cursor: 'pointer',
  });

  const handleAddClick = () => {
    setSelectedRowData(null);
    setModalType('add');
    setModalOpen(true);
  };

  const handleEditClick = (rowData) => {
    setSelectedRowData(rowData);
    setModalType('update');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleCloseDetailModal = () => {
    setModalOpen(false);
    setIsModalDetail(false);
  };

  const handleDeleteClick = async (id, type) => {
    const confirmResult = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc muốn xóa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (confirmResult.isConfirmed) {
      const data = {
        id,
        type,
      };
      try {
        const response = await axiosPrivate.delete('/cadre/deleteAddress', { data });

        if (response.data.status === 'success') {
          // Update local state after successful delete
          Swal.fire({
            icon: 'success',
            title: 'Xóa thành công!',
            text: 'Đã xóa thành công.',
          });
          fetchData();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Xóa thất bại!',
            text: 'Có lỗi xảy ra khi xóa. Vui lòng thử lại.',
          });
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Xóa thất bại!',
          text: 'Có lỗi xảy ra khi xóa. Vui lòng thử lại.',
        });
      }
    }
  };

  const filterData = (data) => {
    if (selectedFilter === 'Quận') {
      return data.filter((row) => row.district_name.toLowerCase().includes(searchTerm.toLowerCase()));
    } else {
      return data.filter((row) => row.ward_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  };

  return (
    <div className={classes.container_wrap}>
      <div className={classes.header}>
        <p className={classes.header__title}>Danh sách quận, phường</p>
        <div className={classes.header__buttonAdd} onClick={handleAddClick}>
          <FontAwesomeIcon icon={faPlus} />
          <p className={classes.add}>Thêm</p>
        </div>
      </div>
      <div className={classes.container}>
        {/* Tab Filter */}
        <div className={classes.container__header}>
          <div className={classes.container__header_filter}>
            <div onClick={() => handleFilterChange('Quận')} style={getFilterStyle('Quận')}>
              Quận
            </div>
            <div onClick={() => handleFilterChange('Phường')} style={getFilterStyle('Phường')}>
              Phường
            </div>
          </div>
          <div className={classes.container__header_search}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={classes.ic} />
            <input
              type="text"
              id="inputSearch"
              placeholder={selectedFilter === 'Quận' ? 'Tìm kiếm tên quận' : 'Tìm kiếm tên phường'}
              // placeholder="Tìm kiếm..."
              className={classes.text_input}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Header */}
        <div className={classes.table_header}>
          <table className={classes.table__header_wrap}>
            <thead className={classes.table__header_wrap_thead}>
              <tr>
                <th style={{ width: '5%' }}>STT</th>
                <th style={{ width: '25%' }}>Khu vực</th>
                <th style={{ width: '25%' }}>Tên cán bộ quản lý</th>
                <th style={{ width: '15%' }}>Email</th>
                <th style={{ width: '15%' }}>Số điện thoại</th>
                <th style={{ width: '15%' }}>Chỉnh sửa</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Table Body */}
        <div className={classes.table__body}>
          <table className={classes.table__body_wrap}>
            <tbody>
              {selectedFilter === 'Quận' &&
                filterData(data.districts).map((row, rowIndex) => (
                  <tr
                    className={classes.table__body_wrap_row}
                    key={rowIndex}
                    onClick={() => {
                      setSelectedRowData(row);
                      setIsModalDetail(true);
                    }}
                  >
                    <td style={{ width: '5%' }}>{rowIndex + 1}</td>
                    <td style={{ width: '25%' }}>{row.district_name}</td>
                    <td style={{ width: '25%' }}>{row.district_manager_username}</td>
                    <td style={{ width: '15%' }}>{row.district_manager_email}</td>
                    <td style={{ width: '15%' }}>{row.district_manager_phone}</td>
                    <td style={{ width: '15%' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(row.district_id, 'district');
                        }}
                        className={classes.btn_trash}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(row);
                        }}
                        className={classes.btn_pen}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </td>
                  </tr>
                ))}

              {selectedFilter === 'Phường' &&
                filterData(data.wards).map((row, rowIndex) => (
                  <tr
                    className={classes.table__body_wrap_row}
                    key={rowIndex}
                    onClick={() => {
                      setSelectedRowData(row);
                      setIsModalDetail(true);
                    }}
                  >
                    <td style={{ width: '5%' }}>{rowIndex + 1}</td>
                    <td style={{ width: '25%' }}>
                      {row.ward_name}, {row.district_name}
                    </td>
                    <td style={{ width: '25%' }}>{row.ward_manager_username}</td>
                    <td style={{ width: '15%' }}>{row.ward_manager_email}</td>
                    <td style={{ width: '15%' }}>{row.ward_manager_phone}</td>
                    <td style={{ width: '15%' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(row.ward_id, 'ward');
                        }}
                        className={classes.btn_trash}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(row);
                        }}
                        className={classes.btn_pen}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalDetail && (
        <Modal onClose={handleCloseDetailModal}>
          <DetailAddress data={selectedRowData} onClose={updateDataAfterDetail} filteredData={selectedFilter} />
        </Modal>
      )}

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          {modalType === 'add' ? (
            <ModalAdd onClose={updateDataAfterAdd} />
          ) : modalType === 'update' ? (
            <ModalUpdate data={selectedRowData} onClose={updateDataAfterAdd} filteredData={selectedFilter} />
          ) : null}
        </Modal>
      )}
    </div>
  );
};

export default ManageDistrictWard;

