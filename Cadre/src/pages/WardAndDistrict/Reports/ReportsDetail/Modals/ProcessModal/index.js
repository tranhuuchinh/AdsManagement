import classes from './styles.module.scss';
import { faXmark, faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { colors } from '~styles/colors';
import { IconTextBtn } from '~components/button';
import { useState } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import { axiosRequest } from '~/src/api/axios';

const fontSize = 16;

const CssTextField = styled(TextField, {
  shouldForwardProp: (props) => props !== 'focusColor',
})((p) => ({
  // input label when focused
  '& label.Mui-focused': {
    color: p.focusColor,
  },
  // focused color for input with variant='standard'
  '& .MuiInput-underline:after': {
    borderBottomColor: p.focusColor,
  },
  // focused color for input with variant='filled'
  '& .MuiFilledInput-underline:after': {
    borderBottomColor: p.focusColor,
  },
  // focused color for input with variant='outlined'
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: p.focusColor,
    },
  },
  // Label
  '& .MuiFormLabel-root': {
    fontSize: fontSize,
  },
}));

export default function ProcessModal(props) {
  const { setActive, email } = props;
  const [loading, setLoading] = useState(false);

  const [handlingMethod, setHandlingMethod] = useState();

  const handleConfirm = async () => {
    setLoading(true);
    const body = {
      email: email,
      content: handlingMethod,
    };
    await axiosRequest
      .post(`ward/replyReport`, body)
      .then((res) => {
        setActive(false);
        Swal.fire({
          icon: 'success',
          title: 'Thông báo',
          text: 'Gửi thành công',
          width: '50rem',
          confirmButtonColor: colors.primary_300,
        });
      })
      .catch((error) => {
        console.log('Send email error: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={classes.main_container}>
      <div className={classes.header}>
        <div className={classes.header__title}>Xử lý báo cáo</div>
        <div className={classes.header__closeIc} onClick={() => setActive(false)}>
          <FontAwesomeIcon icon={faXmark} />
        </div>
      </div>

      <div className={classes.content}>
        <div className={classes.textField}>
          <CssTextField
            defaultValue={null}
            variant="outlined"
            label={'Cách thức xử lý'}
            fullWidth
            multiline
            rows={10}
            InputProps={{ style: { fontSize: fontSize } }}
            focusColor={colors.primary_300}
            onChange={(event) => setHandlingMethod(event.target.value)}
          />
        </div>
      </div>

      <div className={classes.btn_container}>
        <IconTextBtn label="Gửi" rightIc={faShare} onClick={() => handleConfirm()} />
      </div>

      <Backdrop sx={{ color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}