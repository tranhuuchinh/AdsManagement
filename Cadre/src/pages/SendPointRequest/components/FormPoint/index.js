import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classes from './Form.module.scss';
import { useNavigate, useParams } from 'react-router';
import request from '~/src/utils/request';
import Swal from 'sweetalert2';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '~/src/firebase';
import { v4 } from 'uuid';
import { Backdrop, CircularProgress } from '@mui/material';
import useAxiosPrivate from '~/src/hook/useAxiosPrivate';

const locationOptions = [
  'Đất công/Công viên/Hành lang an toàn giao thông',
  'Đất tư nhân/Nhà ở riêng lẻ',
  'Trung tâm thương mại',
  'Chợ',
  'Cây xăng',
  'Nhà chờ xe buýt',
];

const FormPoint = () => {
  const axiosPrivate = useAxiosPrivate();
  const apiKey = 'AIzaSyAQxG3Ubdo-Nhf6tjGYmXhYDe3yr4vGeDw';
  const pointNavigate = useNavigate();
  const user_type = localStorage.getItem('user_type');
  const { point_id } = useParams();
  const [pointInfor, setPointInfor] = useState({});
  const [advertisementTypes, setAdvertisementTypes] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploadUrl, setImageUploadUrl] = useState(null);

  const tokenAuth = 'Bearer ' + JSON.stringify(localStorage.getItem('token')).split('"').join('');
  const headers = {
    Authorization: tokenAuth,
  };

  const fetchPointInfor = async () => {
    try {
      const response = await axiosPrivate.get(`point/get_point/${point_id}`);
      setPointInfor(response.data.point);
      setImageUploadUrl(response.data.point.image_url);
      setAddress(response.data.point.address);
    } catch (error) {
      console.error('Error fetching surfaces:', error);
      if (error.response.status === 403) {
        localStorage.clear();
        pointNavigate('/login');
        Swal.fire({
          icon: 'error',
          title: 'Lỗi do hết hạn quyền truy cập',
          width: '50rem',
        });
      }
    }
  };

  const fetchAdvertisementTypes = async () => {
    try {
      const response = await axiosPrivate.get(`advertisement_type`);
      setAdvertisementTypes(response.data.advertisement_types);
    } catch (error) {
      console.error('Error fetching surfaces:', error);
    }
  };
  useEffect(() => {
    fetchPointInfor();
    fetchAdvertisementTypes();
  }, []);

  const formik = useFormik({
    initialValues: {
      officer: user_type,
      advertisement_type_id: '',
      requestTime: '',
      address: address,
      imageURL: '',
      location_type: '',
      isPlanning: true,
      reason: '',
      edit_status: 'pending',
    },
    validationSchema: Yup.object({
      requestTime: Yup.string().required('Vui lòng chọn thời điểm xin chỉnh sửa'),
      reason: Yup.string().required('Vui lòng nhập lý do chỉnh sửa'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const params = {
          advertisement_type_id: values.advertisement_type_id,
          location_type: values.location_type,
          is_planning: values.isPlanning,
          image_url: imageUploadUrl,
          point_id: point_id,
          edit_status: 'pending',
          request_time: values.requestTime,
          reason: values.reason,
        };
        await axiosPrivate.post('edit_point/create', params);

        setSubmitting(false);
        Swal.fire({
          title: 'Tạo yêu cầu chỉnh sửa thành công',
          icon: 'success',
          confirmButtonText: 'Hoàn tất',
          width: '50rem',
        });
        pointNavigate('/advertising-spots');
      } catch (error) {
        console.error(error);
        setSubmitting(false);

        if (error.response.status === 403) {
          localStorage.clear();
          pointNavigate('/login');
          Swal.fire({
            icon: 'error',
            title: 'Lỗi do hết hạn quyền truy cập',
            width: '50rem',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi khi tạo yêu cầu chỉnh sửa',
            width: '50rem',
          });
        }
      }
    },
  });
  useEffect(() => {
    formik.setValues({
      officer: user_type,
      advertisement_type_id: pointInfor.advertisement_type_id,
      requestTime: '',
      address: address,
      imageURL: imageUploadUrl,
      location_type: pointInfor.location_type,
      isPlanning: pointInfor.is_planning > 0 ? true : false,
      reason: '',
      edit_status: 'pending',
    });
  }, [address]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageRef = ref(storage, `images/${file.name + v4()}`);

        try {
          setLoading(true);

          // Upload image to Firebase
          await uploadBytes(imageRef, file);
          // Get image URL
          const imageUrl = await getDownloadURL(imageRef);
          // Save URL to state or perform any desired actions
          setImageUploadUrl(imageUrl);

          setLoading(false);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className={classes['first-row']}>
          <label className={classes['title-input']}>
            Cán bộ:
            <select name="officer" value={formik.values.officer} readOnly>
              <option value="ward">Phường</option>
              <option value="district">Quận</option>
            </select>
          </label>
          <label className={classes['title-input']}>
            Thời điểm:
            <input
              type="date"
              name="requestTime"
              value={formik.values.requestTime || ''}
              onChange={formik.handleChange}
            />
            {formik.touched.requestTime && formik.errors.requestTime ? (
              <div className={classes.error}>{formik.errors.requestTime}</div>
            ) : null}
          </label>
        </div>

        <div className={classes['second-row']}>
          <label className={classes['title-input']}>
            Địa chỉ:
            <input type="text" name="address" value={formik.values.address || ''} readOnly />
          </label>
        </div>

        <div className={classes['third-row']}>
          <label className={classes['title-input']}>
            Hình ảnh:
            <input type="file" accept="image/*" name="image" onChange={handleFileChange} />
          </label>
        </div>

        <div className={classes['fourth-row']}>
          <label className={classes['title-input']}>
            Loại hình thức quảng cáo:
            <select
              name="advertisement_type_id"
              value={formik.values.advertisement_type_id || ''}
              onChange={formik.handleChange}
            >
              <option value="" disabled hidden>
                Chọn loại hình thức quảng cáo
              </option>
              {advertisementTypes.map((advertisementType, index) => (
                <option key={advertisementType.advertisement_type_id} value={advertisementType.advertisement_type_id}>
                  {advertisementType.type_name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={classes['fourth-row']}>
          <label className={classes['title-input']}>
            Loại vị trí:
            <select name="location_type" value={formik.values.location_type || ''} onChange={formik.handleChange}>
              <option value="" disabled hidden>
                Chọn loại địa điểm
              </option>
              {locationOptions.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={classes['fifth-row']}>
          <label className={classes['title-input']}>
            Tình trạng:
            <select name="isPlanning" value={formik.values.isPlanning || 0} onChange={formik.handleChange}>
              <option value={1}>Đã Quy Hoạch</option>
              <option value={0}>Chưa Quy Hoạch</option>
            </select>
          </label>
        </div>

        <div className={classes['sixth-row']}>
          <label className={classes['title-input']}>
            Lý do:
            <textarea name="reason" value={formik.values.reason || ''} onChange={formik.handleChange} />
            {formik.touched.reason && formik.errors.reason ? (
              <div className={classes.error}>{formik.errors.reason}</div>
            ) : null}
          </label>
        </div>

        <button className={classes['custom-button']} type="submit" disabled={formik.isSubmitting}>
          Gửi yêu cầu
        </button>
      </form>
      <Backdrop sx={{ color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default FormPoint;
