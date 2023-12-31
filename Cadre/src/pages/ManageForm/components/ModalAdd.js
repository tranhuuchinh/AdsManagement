import React, { useState } from 'react';
import classes from './ModalAdd.module.scss';
import Swal from 'sweetalert2';
import { axiosClient } from '../../../api/axios';

const ModalAdd = ({ onClose }) => {
  const [formType, setFormType] = useState('report');
  const [content, setContent] = useState('');

  const tokenAuth = 'Bearer ' + JSON.stringify(localStorage.getItem('token')).split('"').join('');
  const headers = {
    Authorization: tokenAuth,
  };

  const handleTypeChange = (type) => {
    setFormType(type);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Thực hiện lưu dữ liệu vào cơ sở dữ liệu hoặc thực hiện các xử lý khác
    const data = {
      type: formType,
      typeName: content,
    };

    if (!data.typeName) {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng nhập nội dung.',
        timer: 1500,
      });
      return;
    }

    try {
      const response = await axiosClient.post('/cadre/addForm', data, { headers });
      console.log(data);

      if (response.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Thêm thành công!',
          timer: 1500,
          showConfirmButton: false,
        });

        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Thêm thất bại!',
          timer: 1500,
          text: 'Có lỗi xảy ra khi thêm nội dung. Vui lòng thử lại.',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Thêm thất bại!',
        timer: 1500,
        text: 'Có lỗi xảy ra khi thêm nội dung. Vui lòng thử lại.',
      });
    }
  };

  return (
    <form onSubmit={handleSave}>
      <p className={classes.tilte_modal}>THÊM LOẠI HÌNH QC/HÌNH THỨC BC </p>
      <div className={classes.modal_container}>
        <div className={classes.level_wrap}>
          <p className={classes.level_wrap_title}>Thêm loại:</p>
          <div className={classes.level_wrap_container}>
            <div>
              <label className={classes.label_add} htmlFor="report-level">
                Thêm loại hình quảng cáo
              </label>
              <input
                id="report-level"
                type="radio"
                value="report"
                checked={formType === 'report'}
                onChange={() => handleTypeChange('report')}
              />
            </div>
            <div>
              <label className={classes.label_add} htmlFor="advertisement-level">
                Thêm hình thức báo cáo
              </label>
              <input
                id="advertisement-level"
                type="radio"
                value="advertisement"
                checked={formType === 'advertisement'}
                onChange={() => handleTypeChange('advertisement')}
              />
            </div>
            <div>
              <label className={classes.label_add} htmlFor="board-level">
                Thêm loại bảng quảng cáo
              </label>
              <input
                id="board-level"
                type="radio"
                value="board"
                checked={formType === 'board'}
                onChange={() => handleTypeChange('board')}
              />
            </div>
          </div>
        </div>
        <div className={classes.content_wrap}>
          <label htmlFor="content" className={classes.title_label}>
            Thêm nội dung:
          </label>
          <input
            id="content"
            className={classes.input_area}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className={classes.button_wrap}>
          <button className={classes.buttonAdd} type="submit">
            Lưu
          </button>
        </div>
      </div>
    </form>
  );
};

export default ModalAdd;

