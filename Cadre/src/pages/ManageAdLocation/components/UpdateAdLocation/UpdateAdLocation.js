import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { v4 } from 'uuid';
import Coordination from '~/src/components/Coordination/Coordination';
import Modal from '~/src/components/Modal/Modal';
import { storage } from '~/src/firebase';
import useAxiosPrivate from '~/src/hook/useAxiosPrivate';
import classes from './UpdateAdLocation.module.scss';

const UpdateAdLocation = ({ data, onClose, cancel }) => {
  const axiosPrivate = useAxiosPrivate();

  const [indexCur, setIndexCur] = useState(1);
  const [previewImage, setPreviewImage] = useState(data?.image_url || null);
  const [wards, setWards] = useState([]);
  const [adsType, setAdsType] = useState([]);
  const [isModalMap, setModalMap] = useState(false);

  const [address, setAddress] = useState(data?.address);
  const [longitude, setLongitude] = useState(data?.lng || '');
  const [latitude, setLatitude] = useState(data?.lat || '');
  const [locationType, setLocationType] = useState(data?.location_type || '');
  const [selectedWard, setSelectedWard] = useState(data?.ward_id || '');

  const [planning, setPlanning] = useState(!!data?.is_planning);
  const [selectedAdsType, setselectedAdsType] = useState(data?.advertisement_type_id || '');
  const [imageUploadUrl, setImageUploadUrl] = useState(data?.image_url);

  useEffect(() => {
    axiosPrivate
      .get('cadre/wards')
      .then((response) => {
        setWards(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    axiosPrivate
      .get('cadre/adsType')
      .then((response) => {
        setAdsType(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPreviewImage(reader.result);

        const imageRef = ref(storage, `images/${file.name + v4()}`);

        try {
          // Tải ảnh lên Firebase
          await uploadBytes(imageRef, file);
          // Lấy URL của ảnh
          const imageUrl = await getDownloadURL(imageRef);
          // Lưu URL vào state hoặc làm bất cứ điều gì bạn muốn
          setImageUploadUrl(imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageUploadUrl === null) {
      console.log('Vui lòng chờ xử lý hình ảnh');
      alert('Vui lòng chờ xử lý hình ảnh');
      return;
    }
    const dataToSend = {
      point_id: data.point_id,
      location_type: locationType,
      lng: parseFloat(longitude),
      lat: parseFloat(latitude),
      address,
      ward_id: selectedWard,
      is_planning: planning,
      image_url: imageUploadUrl,
      advertisement_type_id: selectedAdsType,
    };
    if (
      !dataToSend.lng ||
      !dataToSend.lat ||
      !dataToSend.location_type ||
      !dataToSend.ward_id ||
      !dataToSend.address ||
      !dataToSend.image_url ||
      !dataToSend.advertisement_type_id ||
      !dataToSend.point_id ||
      dataToSend.is_planning === undefined
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng nhập nội dung.',
        timer: 1500,
      });
      return;
    }
    console.log(dataToSend);
    try {
      const response = await axiosPrivate.patch('/cadre/updateAdsPoint', dataToSend);

      if (response.data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công!',
          timer: 1500,
          showConfirmButton: false,
        });

        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Cập nhật thất bại!',
          timer: 1500,
          text: 'Có lỗi xảy ra khi thêm nội dung. Vui lòng thử lại.',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Cập nhật thất bại!',
        timer: 1500,
        text: 'Có lỗi xảy ra khi thêm nội dung. Vui lòng thử lại.',
      });
    }
  };

  const handleCloseModalMap = () => {
    setModalMap(false);
  };

  return (
    <div className={classes.adding__overlay}>
      <div className={classes.adding__modal}>
        <form onSubmit={handleSubmit}>
          <div className={classes.adding__modal__heading}>
            THÊM ĐIỂM ĐẶT QUẢNG CÁO
            <FontAwesomeIcon icon={faClose} className={classes['adding__modal-ic']} onClick={onClose} />
          </div>
          <div className={classes.adding__modal__body}>
            {indexCur === 1 && (
              <>
                <h4>Chọn khu vực:</h4>
                <select value={selectedWard || ''} onChange={(e) => setSelectedWard(e.target.value)}>
                  <option value="" disabled>
                    Chọn phường
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.ward_id} value={ward.ward_id}>
                      {ward.ward_name}, {ward.district_name}
                    </option>
                  ))}
                </select>
                <h4>Vĩ độ (Latitude):</h4>
                <input
                  type="text"
                  placeholder="Nhập vào vĩ độ"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
                <h4>Kinh độ (Longitude):</h4>
                <input
                  type="text"
                  placeholder="Nhập vào kinh độ"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
                <h4>Nhập địa chỉ:</h4>
                <input
                  type="text"
                  placeholder="Nhập vào địa chỉ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <div onClick={(e) => setModalMap(true)} style={{ marginTop: '10px' }}>
                  <span className={classes.choice_map}>Chọn trên bản đồ</span>
                </div>
                <h4>Chọn loại vị trí:</h4>
                <select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
                  <option value="" disabled>
                    Chọn loại vị trí
                  </option>
                  <option value={'Đất công/Công viên/Hành lang an toàn giao thông'}>
                    Đất công/Công viên/Hành lang an toàn giao thông
                  </option>
                  <option value={'Đất tư nhân/Nhà ở riêng lẻ'}> Đất tư nhân/Nhà ở riêng lẻ</option>
                  <option value={'Trung tâm thương mại'}>Trung tâm thương mại</option>
                  <option value={'Chợ'}>Chợ</option>
                  <option value={'Cây xăng'}>Cây xăng</option>
                  <option value={'Nhà chờ xe buýt'}>Nhà chờ xe buýt</option>
                </select>
              </>
            )}
            {indexCur === 2 && (
              <>
                <h4>Trạng thái quy hoạch</h4>
                <select value={planning} onChange={(e) => setPlanning(e.target.value === 'true')}>
                  <option value="" disabled>
                    Chọn trạng thái
                  </option>
                  <option value="false">Chưa quy hoạch</option>
                  <option value="true">Đã quy hoạch</option>
                </select>
                <h4>Hình thức quảng cáo</h4>
                <select value={selectedAdsType || ''} onChange={(e) => setselectedAdsType(e.target.value)}>
                  <option value="" disabled>
                    Chọn hình thức quảng cáo
                  </option>
                  {adsType.map((type) => (
                    <option key={type.advertisement_type_id} value={type.advertisement_type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
                <h4>Chọn hình ảnh</h4>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {previewImage && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
                    <p style={{ marginBottom: '10px' }}>Xem trước hình ảnh:</p>
                    <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  </div>
                )}
              </>
            )}
          </div>
          <div className={classes.adding__modal__line}>
            {[1, 2].map((index) => (
              <div
                key={index}
                className={classes['modal__line-item']}
                style={{
                  backgroundColor: index === indexCur ? '#0A6971' : '',
                }}
              />
            ))}
          </div>
          <div className={classes.adding__modal__buttons}>
            {indexCur === 1 && <button onClick={() => cancel()}>Hủy</button>}
            {indexCur === 2 && (
              <button
                onClick={() => {
                  setIndexCur(1);
                }}
              >
                Quay lại
              </button>
            )}
            {indexCur === 1 && (
              <button
                onClick={() => {
                  setIndexCur(2);
                }}
              >
                Tiếp tục
              </button>
            )}
            {indexCur === 2 && <button>Cập nhật</button>}
          </div>
        </form>
      </div>

      {isModalMap && (
        <Modal>
          <div style={{ width: '40vw', height: '100%' }}>
            <Coordination
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              setAddress={setAddress}
              setModalMap={setModalMap}
              onClose={handleCloseModalMap}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UpdateAdLocation;
