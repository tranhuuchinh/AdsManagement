const catchAsync = require('../utils/catchAsync');
const connection = require('../server'); // Sử dụng module quản lý kết nối cơ sở dữ liệu
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

const createAccount = catchAsync(async (req, res, next) => {
  const { username, password, email, phone, dob, user_type } = req.body;

  const insertAcc = 'insert into user (username, password, email, phone,dob, user_type) values (?,?,?,?,?,?)';

  const stringToHash = password;

  bcrypt.hash(stringToHash, 10, (err, hashPassword) => {
    if (err) {
      console.error(err);
    }

    connection.query(insertAcc, [username, hashPassword, email, phone, dob, user_type], (error, result) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        return res.status(401).json({
          error: 'Invalid Information.',
        });
      }
      const account = {
        user_id: result.insertId,
        username,
        email,
        hashPassword,
        phone,
        dob,
        user_type,
      };
      res.status(200).json({
        status: 'success',
        account,
      });
    });
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({
      status: 'fail',
      msg: 'Please provide email and password',
    });
  }

  connection.query(
    `select * from user u left join ward w on u.user_id = w.manager_id left join district d on u.user_id = d.manager_id where u.email = ?`,
    email,
    (err, results) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!results[0] || !bcrypt.compareSync(password, results[0].password))
        return res.status(401).json({
          status: 'fail',
          msg: 'Invalid Credential!',
        });

      const { refresh_token, ...user } = results[0];

      // Tạo mới Access Token và Refresh Token
      const accessToken = generateToken.accessToken(user);
      const refreshToken = generateToken.refreshToken(user);

      // Cập nhật Refresh Token vào cơ sở dữ liệu
      connection.query(
        `UPDATE user SET refresh_token = ? WHERE user_id = ?`,
        [refreshToken, results[0].user_id],
        (err, resultsUpdated) => {
          if (err) {
            console.error('Error executing query: ' + err.stack);
            return res.status(500).json({ error: 'Database error' });
          }

          // Gửi Access Token và Refresh Token về client
          res.status(200).json({
            status: 'success',
            user_id: results[0].user_id,
            user_type: results[0].user_type,
            ward_id: results[0].ward_id,
            district_id: results[0].district_id,
            token: accessToken,
            refresh_token: refreshToken,
          });
        }
      );
    }
  );
});

const forgotPassword = async (req, res) => {
  const { email, new_password, otp, otp_verify } = req.body;
  if (otp_verify) {
    if (!email || !new_password || !otp || !otp_verify) {
      return res.status(200).json({ message: 'Please provide information needed' });
    } else {
      //Hashing password
      const salt = await bcrypt.genSalt(10);
      const passwordHashed = await bcrypt.hash(new_password, salt);

      const OTP_verify = jwt.verify(otp_verify, process.env.SECRET_KEY);
      if (OTP_verify.OTP === otp) {
        //handle change password
        connection.query('UPDATE user SET password = ? WHERE email = ?', [passwordHashed, email], (err, results) => {
          if (err) {
            console.error('Error executing query: ' + err.stack);
            return res.status(500).json({ error: 'Database error' });
          }
          res.status(200).json({
            status: 'Success',
            message: 'Change password success',
          });
        });
      } else {
        res.status(200).json({ message: 'Incorrect OTP' });
      }
    }
  } else {
    res.status(400).json({ message: 'OTP does not exist' });
  }
};

const register = catchAsync(async (req, res, next) => {
  const { username, password, email, phone, dob, user_type, officer_id } = req.body;

  const insertAcc = 'insert into user (username, password, email, phone,dob, user_type) values (?,?,?,?,?,?)';

  const stringToHash = password;

  bcrypt.hash(stringToHash, 10, (err, hashPassword) => {
    if (err) {
      console.error(err);
    }
    connection.query(insertAcc, [username, hashPassword, email, phone, dob, user_type], (error, result) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        return res.status(403).json({
          error: 'Invalid Information.',
        });
      }

      const account = {
        user_id: result.insertId,
        username,
        email,
        hashPassword,
        phone,
        dob,
        user_type,
      };

      if (user_type !== 'department') {
        const updateQuery = `UPDATE ${user_type} SET manager_id = ? WHERE ${user_type}_id = ?`;

        connection.query(updateQuery, [result.insertId, officer_id], (error2, result2) => {
          if (error2) {
            console.error('Error executing query: ' + error2.stack);
            return res.status(401).json({
              error: 'Invalid Information.',
            });
          }

          return res.status(200).json({
            status: 'success',
            data: account,
          });
        });
      } else
        return res.status(200).json({
          status: 'success',
          data: account,
        });
    });
  });
});

const logout = catchAsync(async (req, res, next) => {
  if (req.body.refresh_token) {
    const refresh_token = req.body.refresh_token;
    connection.query(
      `UPDATE user SET refresh_token = NULL WHERE refresh_token = ?`,
      [refresh_token],
      (err, results) => {
        if (err) {
          console.error('Error executing query: ' + err.stack);
          return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows > 0) {
          res.status(200).json({
            status: 'success',
            msg: 'Logout successful',
          });
        } else {
          res.status(404).json({
            status: 'not found',
            msg: 'Not Found User To Logout',
          });
        }
      }
    );
  } else {
    return res.status(400).json({ message: 'Please provide token needed' });
  }
});

const refreshToken = catchAsync(async (req, res, next) => {
  const newAccessToken = generateToken.accessToken(req.user);
  // console.log(newAccessToken);

  res.status(200).json({
    access_token: newAccessToken,
  });
});

module.exports = { register, createAccount, login, forgotPassword, refreshToken, logout };
