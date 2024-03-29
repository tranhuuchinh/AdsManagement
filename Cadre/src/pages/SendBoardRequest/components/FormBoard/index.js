import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import classes from './Form.module.scss';
import request from '~/src/utils/request';
import { useNavigate, useParams } from 'react-router';
import Swal from 'sweetalert2';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '~/src/firebase';
import { v4 } from 'uuid';
import { Backdrop, CircularProgress } from '@mui/material';
import useAxiosPrivate from '~/src/hook/useAxiosPrivate';

const FormBoard = () => {
  const axiosPrivate = useAxiosPrivate();
  const apiKey = 'AIzaSyAQxG3Ubdo-Nhf6tjGYmXhYDe3yr4vGeDw';
  const boardNavigate = useNavigate();
  const user_type = localStorage.getItem('user_type');
  const { board_id } = useParams();
  const [boardTypes, setBoardTypes] = useState([]);
  const [boardInfor, setBoardInfor] = useState({});
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploadUrl, setImageUploadUrl] = useState(null);

  const tokenAuth = 'Bearer ' + JSON.stringify(localStorage.getItem('token')).split('"').join('');
  const headers = {
    Authorization: tokenAuth,
  };

  const fetchBoardTypes = async () => {
    try {
      const response = await axiosPrivate.get(`board_type`);
      setBoardTypes(response.data.board_types);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const fetchInfor = async () => {
    try {
      const responseBoard = await axiosPrivate.get(`board/get_board/${board_id}`);
      const responsePoint = await axiosPrivate.get(`point/get_point/${responseBoard.data.board.point_id}`, {
        headers: headers,
      });
      setBoardInfor(responseBoard.data.board);
      setAddress(responsePoint.data.point.address);
      setImageUploadUrl(responseBoard.data.board.advertisement_image_url);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response.status === 403) {
        localStorage.clear();
        boardNavigate('/login');
        Swal.fire({
          icon: 'error',
          title: 'Lỗi do hết hạn quyền truy cập',
          width: '50rem',
        });
      }
    }
  };

  useEffect(() => {
    fetchBoardTypes();
    fetchInfor();
  }, []);

  const formik = useFormik({
    initialValues: {
      officer: user_type,
      requestTime: '',
      address: address,
      boardType: '',
      imageURL: '',
      width: '',
      height: '',
      content: '',
      reason: '',
      edit_status: 'pending',
    },
    validationSchema: Yup.object({
      requestTime: Yup.string().required('Thời điểm là bắt buộc'),
      boardType: Yup.string().required('Hình thức quảng cáo là bắt buộc'),
      width: Yup.number()
        .typeError('Vui lòng nhập một số')
        .required('Vui lòng nhập kích thước phù hợp')
        .min(0, 'Vui lòng nhập một số lớn hơn 0'),
      height: Yup.number()
        .typeError('Vui lòng nhập một số')
        .required('Vui lòng nhập kích thước phù hợp')
        .min(0, 'Vui lòng nhập một số lớn hơn 0'),
      content: Yup.string().required('Nội dung không được để trống'),
      reason: Yup.string().required('Vui lòng nhập lý do'),
      // Add more validation rules as needed
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const params = {
          board_id: board_id,
          board_type_id: values.boardType,
          edit_status: values.edit_status,
          advertisement_content: values.content,
          advertisement_image_url: imageUploadUrl,
          request_time: values.requestTime,
          reason: values.reason,
          width: values.width,
          height: values.height,
        };
        await axiosPrivate.post('edit_board/create', params);

        setSubmitting(false);
        Swal.fire({
          title: 'Tạo yêu cầu chỉnh sửa thành công',
          icon: 'success',
          confirmButtonText: 'Hoàn tất',
          width: '50rem',
        });
        boardNavigate('/advertising-spots');
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        if (error.response.status === 403) {
          localStorage.clear();
          boardNavigate('/login');
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
      requestTime: '',
      address: address,
      boardType: boardInfor.board_type_id,
      imageURL: imageUploadUrl,
      width: boardInfor.width,
      height: boardInfor.height,
      content: boardInfor.advertisement_content,
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
            <select name="officer" value={formik.values.officer} disabled>
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
            Loại bảng quảng cáo:
            <select name="boardType" defaultValue={formik.values.boardType || ''} onChange={formik.handleChange}>
              {boardTypes.map((board) => (
                <option key={board.board_type_id} value={board.board_type_id || ''}>
                  {board.type_name}
                </option>
              ))}
            </select>
            {formik.touched.boardType && formik.errors.boardType ? (
              <div className={classes.error}>{formik.errors.boardType}</div>
            ) : null}
          </label>

          <label className={classes['title-input']}>
            Hình ảnh :
            <input type="file" accept="image/*" name="imageURL" onChange={handleFileChange} />
          </label>
        </div>

        <div className={classes['fourth-row']}>
          <label className={classes['title-input']}>
            Chiều rộng:
            <input
              type="number"
              step={0.01}
              name="width"
              value={formik.values.width || ''}
              onChange={formik.handleChange}
            />
            {formik.touched.width && formik.errors.width ? (
              <div className={classes.error}>{formik.errors.width}</div>
            ) : null}
          </label>
          <label className={classes['title-input']}>
            Chiều cao:
            <input
              type="number"
              step={0.01}
              name="height"
              value={formik.values.height || ''}
              onChange={formik.handleChange}
            />
            {formik.touched.height && formik.errors.height ? (
              <div className={classes.error}>{formik.errors.height}</div>
            ) : null}
          </label>
        </div>

        <div className={classes['sixth-row']}>
          <label className={classes['title-input']}>
            Nội dung:
            <textarea name="content" value={formik.values.content || ''} onChange={formik.handleChange} />
            {formik.touched.content && formik.errors.content ? (
              <div className={classes.error}>{formik.errors.content}</div>
            ) : null}
          </label>
        </div>

        <div className={classes['seventh-row']}>
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

export default FormBoard;
