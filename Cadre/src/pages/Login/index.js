import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup'; // Để thực hiện validation

import request from '../../utils/request';
import classes from './Login.module.scss';
import Images from '../../assets/images';
import Swal from 'sweetalert2';
import getGoogleOAuthURL from '~/src/utils/getGoogleUrl';

import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUser } from '~/src/store/reducers';
import auth from '../../utils/auth';
import setLocalStorageFromCookie from '~/src/utils/setLocalStorageFromCookie';

const LoginPage = () => {
  const loginNavigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  (async () => {
    setLocalStorageFromCookie('user-state');
    setLocalStorageFromCookie('user_type');
    setLocalStorageFromCookie('user_id');
    setLocalStorageFromCookie('token');
    setLocalStorageFromCookie('refresh_token');
    setLocalStorageFromCookie('ward_id');
    setLocalStorageFromCookie('district_id');
  })();
  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    if (userType) {
      dispatch(
        setUser({
          'user-state': true,
          user_id: localStorage.getItem('user_id'),
          user_type: userType,
          token: localStorage.getItem('token'),
          refresh_token: localStorage.getItem('refresh_token'),
          ward_id: localStorage.getItem('ward_id'),
          district_id: localStorage.getItem('district_id'),
        })
      );
    }
  }, []);
  useEffect(() => {
    const user_type = localStorage.getItem('user_type');
    if (user_type === 'department') {
      loginNavigate('/district-ward');
    } else if (user_type === 'ward') {
      loginNavigate('/home');
    } else if (user_type === 'district') {
      loginNavigate('/home');
    }
  }, [user]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email của bạn'),
      password: Yup.string().required('Vui lòng nhập mật khẩu của bạn'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await request.post('auth/login', values);
        auth.login(response.data);
        const user_type = response.data.user_type;

        dispatch(
          setUser({
            'user-state': true,
            user_id: response.data.user_id,
            user_type: user_type,
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            ward_id: response.data.ward_id,
            district_id: response.data.district_id,
          })
        );

        setSubmitting(false);

        Swal.fire({
          title: 'Đăng nhập thành công!',
          icon: 'success',
          confirmButtonText: 'Hoàn tất',
          width: '50rem',
        });
        if (user_type === 'department') {
          loginNavigate('/district-ward');
        } else if (user_type === 'ward') {
          loginNavigate('/home');
        } else if (user_type === 'district') {
          loginNavigate('/home');
        }
      } catch (error) {
        console.log(error);
        setSubmitting(false);

        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Email hoặc mật khẩu của bạn không đúng!',
          width: '50rem',
        });
      }
    },
  });

  return (
    <div className={classes.wrapper}>
      <div className={classes.wrapper__logo}>
        <img src={Images.logoImage} alt="none" />
      </div>
      <div className={classes.wrapper__form}>
        <h2>Đăng nhập</h2>
        <form onSubmit={formik.handleSubmit}>
          <p>
            <input
              type="text"
              name="email"
              placeholder="Nhập email của bạn"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && <div className={classes.error}>{formik.errors.email}</div>}
          </p>
          <p>
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu của bạn"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <div className={classes.error}>{formik.errors.password}</div>
            )}
            <br />
            <br />
            <Link to="/forgot">
              <label className={classes['right-label']}>Quên mật khẩu?</label>
            </Link>
          </p>
          <p>
            <button id={classes.sub__btn} type="submit" disabled={formik.isSubmitting}>
              Đăng nhập
            </button>
          </p>
        </form>
        <a href={getGoogleOAuthURL()} className={classes['login-button']}>
          <img src={Images.googleImage} alt="Google Logo" className={classes['google-logo']} />
          <div className={classes['right-content']}>
            <span>Đăng nhập với tài khoản Google</span>
          </div>
        </a>
        {/* <a href={getGoogleOAuthURL()}>Login with google</a> */}
      </div>
    </div>
  );
};

export default LoginPage;

