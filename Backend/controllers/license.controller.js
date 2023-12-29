const catchAsync = require('../utils/catchAsync');
const connection = require('../server');
const socket = require('../app');

const createLicensingRequest = catchAsync(async (req, res, next) => {
  const { advertisement_content, advertisement_image_url, point_id, width, height, contract_id } = req.body;

  const queryInsert = `INSERT INTO licensing_request 
    (advertisement_content, advertisement_image_url,status,point_id,user_id,width,height,contract_id) 
    VALUES (?,?,"Pending",?,?,?,?,?)`;

  connection.query(
    queryInsert,
    [advertisement_content, advertisement_image_url, point_id, req.user.user_id, width, height, contract_id],
    (error, result) => {
      if (error) {
        console.error('Error executing query: ' + error.stack);
        return res.status(401).json({
          error: 'Invalid Information.',
        });
      }

      res.status(200).json({
        status: 'success',
      });
    }
  );
});

const getAllLicenseRequest = catchAsync(async (req, res) => {
  const queryData = `SELECT 
  lr.licensing_id, lr.advertisement_content, lr.advertisement_image_url, 
  lr.status, lr.rejection_reason, lr.user_id, ap.point_id, ap.ward_id, 
  ap.advertisement_type_id, ap.location_type, ap.image_url, ap.lat, ap.lng, 
  ap.is_planning, c.contract_id, c.company_name, c.company_email, c.company_phone, 
  c.company_address, c.company_taxcode, c.start_date, c.end_date, c.representative 
  FROM licensing_request lr 
  JOIN advertising_point ap ON lr.point_id = ap.point_id 
  JOIN contract c ON lr.contract_id = c.contract_id;`;

  connection.query(queryData, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      points: results,
    });
  });
});

module.exports = { createLicensingRequest, getAllLicenseRequest };