import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import {
  faCalendarDays,
  faCircleInfo,
  faClipboard,
  faEnvelope,
  faLocationDot,
  faPhone,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import useAxiosPrivate from '~/src/hook/useAxiosPrivate';
import classes from './DetailActionEdit.module.scss';

const DetailActionEdit = ({ data, onClose }) => {
  const axiosPrivate = useAxiosPrivate();
  const [dataPoint, setDataPoint] = useState();
  const [dataBoard, setDataBoard] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      if (data.board_id) {
        // Nếu có board_id, gọi API cho board
        const responseBoard = await axiosPrivate.get(`/cadre/detailAdsBoard/${data.board_id}`);
        setDataBoard(responseBoard.data);
        console.log(responseBoard.data);
      } else if (data.point_id) {
        // Nếu có point_id, gọi API cho point
        const responsePoint = await axiosPrivate.get(`/cadre/detailAdsPoint/${data.point_id}`);
        setDataPoint(responsePoint.data.advertisingPoint);
        console.log(responsePoint.data.advertisingPoint);
        console.log(data.point_id);
      } else {
        console.error('Không có board_id hoặc point_id để gọi API');
      }
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDateString = (dateString, dateFormat = 'yyyy-MM-dd') => {
    const date = new Date(dateString);
    return format(date, dateFormat);
  };

  const handleReject = async () => {
    try {
      if (data.board_id) {
        const res = await axiosPrivate.patch(`/cadre/updateStatusEditReq/${data.id}`, {
          type: 'board',
          status: 'canceled',
        });

        console.log(res.data);

        if (res.data.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Đã từ chối!',
            timer: 1500,
            showConfirmButton: false,
          });
          onClose();
        }
      } else if (data.point_id) {
        const res = await axiosPrivate.patch(`/cadre/updateStatusEditReq/${data.id}`, {
          type: 'point',
          status: 'canceled',
        });

        if (res.data.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Đã từ chối!',
            timer: 1500,
            showConfirmButton: false,
          });
          onClose();
        }
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const handleApproved = async () => {
    try {
      if (data.board_id) {
        const res = await axiosPrivate.patch(`/cadre/updateStatusEditReq/${data.id}`, {
          type: 'board',
          status: 'approved',
        });

        if (res.data.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Cập nhật trạng thái thành công!',
            timer: 1500,
            showConfirmButton: false,
          });

          const dataBoardToSend = {
            board_type_id: data.board_type_id,
            advertisement_content: data.advertisement_content,
            advertisement_image_url: data.advertisement_image_url,
            width: data.width,
            height: data.height,
            point_id: dataBoard.point_id,
          };

          try {
            const response = await axiosPrivate.patch(`/board/update_board/${data.board_id}`, dataBoardToSend);
            console.log(response.data);

            if (response.data.status === 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Chỉnh sửa bảng quảng cáo thành công!',
                timer: 1500,
                showConfirmButton: false,
              });

              onClose();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Chỉnh sửa bảng quảng cáo thất bại!',
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
        }
      } else if (data.point_id) {
        const res = await axiosPrivate.patch(`/cadre/updateStatusEditReq/${data.id}`, {
          type: 'point',
          status: 'approved',
        });

        if (res.data.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Cập nhật trạng thái thành công!',
            timer: 1500,
            showConfirmButton: false,
          });

          const dataPointToSend = {
            point_id: data.point_id,
            location_type: data.location_type,
            lng: data.lng,
            lat: data.lat,
            address: data.address,
            ward_id: data.ward_id,
            is_planning: !!data.is_planning,
            image_url: data.image_url,
            advertisement_type_id: data.advertisement_type_id,
          };

          console.log(dataPointToSend);

          try {
            const response = await axiosPrivate.patch('/cadre/updateAdsPoint', dataPointToSend);
            console.log(response);

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
        }
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <p className={classes.title}>Chi tiết yêu cầu chỉnh sửa</p>
      </div>
      <div className={classes.container_wrap}>
        <div className={classes.wrap_infor}>
          <div className={classes.infor_left}>
            <ul>
              <li>
                <span>
                  <FontAwesomeIcon icon={faUser} className={classes.icon_infor} />
                </span>
                <span style={{ color: '#0C7F89', fontWeight: '600', marginLeft: '10px' }}>
                  Cán bộ yêu cầu&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                </span>{' '}
                <span>{data.created_by_username}</span>
              </li>
              <li>
                <span>
                  <FontAwesomeIcon icon={faPhone} className={classes.icon_infor} />
                </span>
                <span style={{ color: '#0C7F89', fontWeight: '600', marginLeft: '10px' }}>
                  Số điện thoại&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :
                </span>{' '}
                <span>{data.created_by_phone}</span>
              </li>
              <li>
                <span>
                  <FontAwesomeIcon icon={faEnvelope} className={classes.icon_infor} />
                </span>
                <span style={{ color: '#0C7F89', fontWeight: '600', marginLeft: '10px' }}>
                  Email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                </span>{' '}
                <span>{data.created_by_email}</span>
              </li>
            </ul>
          </div>
          <div className={classes.infor_right}>
            <ul>
              <li>
                <span>
                  <FontAwesomeIcon icon={faCalendarDays} className={classes.icon_infor} />
                </span>
                <span style={{ color: '#0C7F89', fontWeight: '600', marginLeft: '10px' }}>
                  Ngày yêu
                  cầu&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                </span>{' '}
                <span>{formatDateString(data.request_time, 'yyyy-MM-dd')}</span>
              </li>
              <li>
                <span>
                  <FontAwesomeIcon icon={faCircleInfo} className={classes.icon_infor} />
                </span>
                <span style={{ color: '#0C7F89', fontWeight: '600', marginLeft: '10px' }}>
                  Đối tượng cần chỉnh sửa&nbsp;&nbsp;&nbsp;&nbsp;:
                </span>{' '}
                <span>{data.board_id ? 'Bảng quảng cáo' : 'Điểm đặt quảng cáo'}</span>
              </li>
              <li>
                <span>
                  <FontAwesomeIcon icon={faClipboard} className={classes.icon_infor} />
                </span>
                <span style={{ color: '#0C7F89', fontWeight: '600', marginLeft: '10px' }}>
                  Lý do chỉnh
                  sửa&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                </span>{' '}
                <span>{data.reason}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className={classes.container_edit}>
          <div className={classes.edit_left}>
            <div className={classes.wrap_content}>
              <div className={classes.title_edit}>
                <p>Thông tin ban đầu</p>
              </div>
              <div className={classes.scroll_content}>
                {data.board_id && (
                  <div className={classes.img_ads}>
                    {dataBoard && <img src={dataBoard.advertisement_image_url} alt="Ảnh bảng quảng cáo" />}
                  </div>
                )}
                {data.board_id && (
                  <div className={classes.ads_infor}>
                    <FontAwesomeIcon icon={faCircleQuestion} color="#00B2FF" />
                    {dataBoard && (
                      <div>
                        <p className={classes.title_ads_infor}>Thông tin bảng quảng cáo</p>
                        <p className={classes.item_ads}>
                          <span style={{ fontWeight: '600' }}>Loại bảng quảng cáo: </span>
                          <span>{dataBoard.type_name}</span>
                        </p>
                        <p className={classes.item_ads}>
                          <span style={{ fontWeight: '600' }}>Kích thước:</span>{' '}
                          <span>
                            {dataBoard.width}m x {dataBoard.height}m
                          </span>
                        </p>{' '}
                        <p className={classes.item_ads}>
                          <span style={{ fontWeight: '600' }}>Nội dung:</span>{' '}
                          <span>{dataBoard.advertisement_content}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {data.point_id && (
                  <div className={classes.img_ads}>
                    {dataPoint && <img src={dataPoint.image_url} alt="Ảnh bảng quảng cáo" />}
                  </div>
                )}
                {data.point_id && (
                  <div className={classes.point_infor}>
                    <FontAwesomeIcon icon={faLocationDot} color="#00B2FF" />
                    {dataPoint && (
                      <div>
                        <p className={classes.title_point_infor}>Thông tin bảng quảng cáo</p>
                        <p className={classes.item_ads}>
                          <span style={{ fontWeight: '600' }}>Hình thức quảng cáo:</span>{' '}
                          <span>{dataPoint.advertisement_type_name}</span>
                        </p>
                        <p className={classes.item_ads}>
                          <span style={{ fontWeight: '600' }}>Loại vị trí:</span> <span>{dataPoint.location_type}</span>
                        </p>
                        <p className={classes.item_ads}>
                          <span style={{ fontWeight: '600' }}>Quy hoạch:</span>{' '}
                          <span>
                            {dataPoint.is_planning ? (
                              <span style={{ color: 'green' }}>Đã quy hoạch</span>
                            ) : (
                              <span style={{ color: 'red' }}>Chưa quy hoạch</span>
                            )}
                          </span>
                        </p>{' '}
                        <p className={classes.item_ads}>
                          <span style={{ fontWeight: '600' }}>Phường:</span> <span>{dataPoint.ward_name}</span>
                        </p>{' '}
                        <p className={classes.item_ads}>
                          <span style={{ fontWeight: '600' }}>Địa chỉ:</span> <span>{dataPoint.address}</span>
                        </p>{' '}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={classes.edit_right}>
            <div className={classes.wrap_content}>
              <div className={classes.title_edit}>
                <p>Thông tin sau thay đổi</p>
              </div>
              <div className={classes.scroll_content}>
                {data.board_id && (
                  <div className={`${classes.img_ads} ${classes.boardImg}`}>
                    <img src={data.advertisement_image_url} alt="Ảnh bảng quảng cáo" />
                  </div>
                )}
                {data.board_id && dataBoard && (
                  <div className={classes.ads_infor}>
                    <FontAwesomeIcon icon={faCircleQuestion} color="#00B2FF" />
                    <div style={{ height: '100%' }}>
                      <p className={classes.title_ads_infor}>Thông tin bảng quảng cáo</p>
                      <p className={classes.item_ads}>
                        <span style={{ fontWeight: '600' }}>Loại bảng quảng cáo:</span>
                        <span className={dataBoard.type_name !== data.board_type_name ? classes.checkSame : ''}>
                          {data.board_type_name}
                        </span>
                      </p>
                      <p className={classes.item_ads}>
                        <span style={{ fontWeight: '600' }}>Kích thước:</span>{' '}
                        <span
                          className={
                            dataBoard.width !== data.width || dataBoard.width !== data.height ? classes.checkSame : ''
                          }
                        >
                          {data.width}m x {data.height}m
                        </span>
                      </p>
                      <p className={classes.item_ads}>
                        <span style={{ fontWeight: '600' }}>Nội dung:</span>{' '}
                        <span
                          className={
                            dataBoard.advertisement_content !== data.advertisement_content ? classes.checkSame : ''
                          }
                        >
                          {data.advertisement_content}
                        </span>
                      </p>{' '}
                    </div>
                  </div>
                )}

                {data.point_id && (
                  <div className={`${classes.img_ads} ${classes.pointImg}`}>
                    <img src={data.image_url} alt="Ảnh bảng quảng cáo" />
                  </div>
                )}
                {data.point_id && dataPoint && (
                  <div className={classes.point_infor}>
                    <FontAwesomeIcon icon={faLocationDot} color="#00B2FF" />
                    <div style={{ height: '100%' }}>
                      <p className={classes.title_point_infor}>Thông tin điểm đặt quảng cáo</p>
                      <p className={classes.item_ads}>
                        <span style={{ fontWeight: '600' }}>Hình thức quảng cáo: </span>
                        <span
                          className={
                            dataPoint.advertisement_type_name !== data.advertisement_type_name ? classes.checkSame : ''
                          }
                        >
                          {data.advertisement_type_name}
                        </span>
                      </p>
                      <p className={classes.item_ads}>
                        <span style={{ fontWeight: '600' }}>Loại vị trí: </span>{' '}
                        <span className={dataPoint.location_type !== data.location_type ? classes.checkSame : ''}>
                          {data.location_type}
                        </span>
                      </p>
                      <p className={classes.item_ads}>
                        <span style={{ fontWeight: '600' }}>Quy hoạch:</span>{' '}
                        <span className={dataPoint.is_planning !== data.is_planning ? classes.checkSame : ''}>
                          {data.is_planning ? (
                            <span style={{ color: 'green' }}>Đã quy hoạch</span>
                          ) : (
                            <span style={{ color: 'red' }}>Chưa quy hoạch</span>
                          )}
                        </span>
                      </p>{' '}
                      <p className={classes.item_ads}>
                        <span style={{ fontWeight: '600' }}>Phường:</span>{' '}
                        <span className={dataPoint.ward_id !== data.ward_id ? classes.checkSame : ''}>
                          {data.ward_name}
                        </span>
                      </p>
                      <p className={classes.item_ads}>
                        <span style={{ fontWeight: '600' }}>Địa chỉ:</span> <span>{dataPoint.address}</span>
                      </p>{' '}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.wrap_btn}>
        <div className={classes.btn_reject} onClick={handleReject}>
          Từ chối
        </div>
        <div className={classes.btn_ok} onClick={handleApproved}>
          Duyệt
        </div>
      </div>
    </div>
  );
};

export default DetailActionEdit;
