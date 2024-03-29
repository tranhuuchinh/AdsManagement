const catchAsync = require('../utils/catchAsync');
const connection = require('../server'); // Sử dụng module quản lý kết nối cơ sở dữ liệu
const socket = require('../app');

const getInforBoard = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  connection.query(
    `SELECT
      ab.*,
      bt.type_name AS board_type_name,
      ep.edit_status,
      ep.reason AS edit_reason,
      bt.type_name AS board_type_name,
      ap.ward_id,
      w.ward_name
    FROM
      advertising_board ab
    LEFT JOIN
      board_type bt ON ab.board_type_id = bt.board_type_id
    LEFT JOIN
      edit_request_point ep ON ab.point_id = ep.point_id
    LEFT JOIN
      advertising_point ap ON ab.point_id = ap.point_id
    LEFT JOIN
      ward w ON ap.ward_id = w.ward_id
    WHERE
      ab.board_id = ?`,
    id,
    (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ status: 'error', error: 'Board not found' });
        return;
      }

      res.status(200).json({
        status: 'success',
        board: results[0],
      });
    }
  );
  // const { id } = req.params;
  // connection.query(`select * from advertising_board where board_id = ?`, id, (err, results) => {
  //   res.status(200).json({
  //     status: 'success',
  //     board: results[0],
  //   });
  // });
});

// const updateBoard = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const { board_type_id, advertisement_content, advertisement_image_url, width, height, point_id } = req.body;
//   console.log('sdfhsdhfjksh');
//   // Kiểm tra xem bảng quảng cáo có tồn tại không
//   const checkBoardQuery = 'SELECT * FROM advertising_board WHERE board_id = ?';
//   connection.query(checkBoardQuery, id, (checkErr, checkResults) => {
//     if (checkErr) {
//       console.error('Error checking board existence:', checkErr);
//       res.status(500).json({ status: 'error', error: 'Internal Server Error' });
//       return;
//     }

//     if (checkResults.length === 0) {
//       res.status(404).json({ status: 'error', error: 'Board not found' });
//       return;
//     }

//     // Nếu tồn tại, thực hiện cập nhật
//     const updateBoardQuery = `
//       UPDATE advertising_board
//       SET
//         board_type_id = ?,
//         advertisement_content = ?,
//         advertisement_image_url = ?,
//         width = ?,
//         height = ?,
//         point_id = ?
//       WHERE
//         board_id = ?
//     `;

//     connection.query(
//       updateBoardQuery,
//       [board_type_id, advertisement_content, advertisement_image_url, width, height, point_id, id],
//       (updateErr, updateResults) => {
//         if (updateErr) {
//           console.error('Error updating board:', updateErr);
//           res.status(500).json({ status: 'error', error: 'Internal Server Error' });
//           return;
//         }

//         res.status(200).json({ status: 'success', message: 'Board updated successfully' });
//       }
//     );
//   });
// });

const updateBoard = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { board_type_id, advertisement_content, advertisement_image_url, width, height, point_id } = req.body;

  // Kiểm tra xem bảng quảng cáo có tồn tại không
  const checkBoardQuery = 'SELECT * FROM advertising_board WHERE board_id = ?';
  connection.query(checkBoardQuery, id, (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking board existence:', checkErr);
      res.status(500).json({ status: 'error', error: 'Internal Server Error' });
      return;
    }

    if (checkResults.length === 0) {
      res.status(404).json({ status: 'error', error: 'Board not found' });
      return;
    }

    // Nếu tồn tại, thực hiện cập nhật
    let updateBoardQuery = 'UPDATE advertising_board SET ';
    const updateValues = [];

    if (board_type_id !== undefined) {
      updateBoardQuery += 'board_type_id = ?, ';
      updateValues.push(board_type_id);
    }

    if (advertisement_content !== undefined) {
      updateBoardQuery += 'advertisement_content = ?, ';
      updateValues.push(advertisement_content);
    }

    if (advertisement_image_url !== undefined) {
      updateBoardQuery += 'advertisement_image_url = ?, ';
      updateValues.push(advertisement_image_url);
    }

    if (width !== undefined) {
      updateBoardQuery += 'width = ?, ';
      updateValues.push(width);
    }

    if (height !== undefined) {
      updateBoardQuery += 'height = ?, ';
      updateValues.push(height);
    }

    if (point_id !== undefined) {
      updateBoardQuery += 'point_id = ?, ';
      updateValues.push(point_id);
    }

    // Xóa dấu ',' cuối cùng nếu có
    updateBoardQuery = updateBoardQuery.replace(/,\s*$/, '');

    updateBoardQuery += ' WHERE board_id = ?';
    updateValues.push(id);

    connection.query(updateBoardQuery, updateValues, (updateErr, updateResults) => {
      if (updateErr) {
        console.error('Error updating board:', updateErr);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
        return;
      }

      socket?.socketIo?.emit(`updateBoard_pointId=${point_id}`, updateValues);

      // Use to notify
      connection.query('select * from advertising_point where point_id = ?', [point_id], (err, results) => {
        if (err) {
          console.error('Error executing query: ', err);
          res.status(500).send('Internal Server Error');
          return;
        }
        socket?.socketIo?.emit(`updateBoard_wardId=${results[0]?.ward_id}`);
      });

      res.status(200).json({ status: 'success', message: 'Board updated successfully' });
    });
  });
});

const getBoardsByPoint = catchAsync(async (req, res, next) => {
  const { point_id } = req.params;
  connection.query(`select * from advertising_board where point_id = ?`, point_id, (err, results) => {
    res.status(200).json({
      status: 'success',
      board: results,
    });
  });
});

const createBoard = catchAsync(async (req, res, next) => {
  const { board_type_id, advertisement_content, advertisement_image_url, width, height, point_id, contract_id } =
    req.body;

  const queryInsert = `
  INSERT INTO advertising_board 
  (board_type_id, advertisement_content, 
  advertisement_image_url, width, height, point_id, contract_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

  connection.query(
    queryInsert,
    [board_type_id, advertisement_content, advertisement_image_url, width, height, point_id, contract_id],
    (error, result) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        return res.status(403).json({
          error: 'Invalid Information.',
        });
      }

      const dataResult = {
        board_id: result.insertId,
        board_type_id,
        advertisement_content,
        advertisement_image_url,
        width,
        height,
        point_id,
        contract_id,
      };

      return res.status(200).json({
        status: 'Create success',
        data: dataResult,
      });
    }
  );
});

const getAllBoards = catchAsync(async (req, res, next) => {
  const query = `
  SELECT
  ab.board_id,
  ab.contract_id,
  ap.address,
  ab.advertisement_image_url,
  ab.advertisement_content,
  ab.width,
  ab.height,
  ab.board_type_id,
  bt.type_name,
  ap.location_type,
  ap.advertisement_type_id,
  c.company_name, 
  c.company_email, 
  c.company_phone, 
  c.company_address, 
  c.company_taxcode, 
  c.start_date, 
  c.end_date, 
  c.representative 
    FROM advertising_board ab
    JOIN contract c ON ab.contract_id = c.contract_id
    JOIN advertising_point ap ON ab.point_id = ap.point_id
    JOIN board_type bt ON ab.board_type_id = bt.board_type_id;
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ status: 'error', error: 'Internal Server Error' });
      return;
    }

    res.status(200).json({
      status: 'success',
      boards: results,
    });
  });
});

const deleteBoardById = catchAsync(async (req, res, next) => {
  const { board_id } = req.params;

  const query = `
  SELECT * FROM  advertising_board WHERE board_id = ${board_id}`;

  connection.query(query, (err, results) => {
    if (err) {
      res.status(404).json({ status: 'error', error: 'Board is not exist' });
      return;
    }

    const deleteQuery = `
    DELETE FROM advertising_board
    WHERE board_id = ${board_id};
  `;

    connection.query(deleteQuery, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ status: 'error', error: 'Internal Server Error' });
        return;
      }

      res.status(200).json({
        status: 'Delete success',
        data: results,
      });
    });
  });
});

module.exports = { createBoard, getInforBoard, updateBoard, getBoardsByPoint, getAllBoards, deleteBoardById };
