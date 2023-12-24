import classes from './styles.module.scss';
import CollapseBtn from './CollapseBtn';
import { useState, useEffect } from 'react';
import { faQuestionCircle, faFlag, faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faAngleLeft, faAngleRight, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { noImage } from '~assets/imgs/Imgs';
import axios from 'axios';
import { axiosRequest } from '~/src/api/axios';

export default function SpotInfoSidebar(props) {
  const { spotCoord, spotId, setCollapse, adSpots } = props;
  const [status, setStatus] = useState(true);
  const [currentAdsIndex, setCurrentAdsIndex] = useState(0);
  const [spotName, setSpotName] = useState();
  const [spotAddress, setSpotAddress] = useState();
  const [loading, setLoading] = useState(false);
  const [currentInfo, setCurrentInfo] = useState();

  useEffect(() => {
    setLoading(true);
    setCurrentAdsIndex(0);
    (async () => {
      await axios
        .get(
          `https://rsapi.goong.io/Geocode?latlng=${spotCoord.lat},${spotCoord.lng}&api_key=${process.env.REACT_APP_GOONG_APIKEY}`
        )
        .then((res) => {
          const data = res.data.results;
          setSpotName(data[0]?.name);
          setSpotAddress(data[0]?.address);
        })
        .catch((error) => {
          console.log('Get spot info error: ', error);
        })
        .finally(() => {
          setLoading(false);
        });
    })();
  }, [spotCoord]);

  useEffect(() => {
    if (!spotId) return;
    (async () => {
      setLoading(true);
      await axiosRequest
        .get(`ward/getInfoByPointId/${spotId}`)
        .then((res) => {
          const data = res.data.data;
          setCurrentInfo(data);
        })
        .catch((error) => {
          console.log('Get info error: ', error);
        })
        .finally(() => {
          setLoading(false);
        });
    })();
  }, [spotId, adSpots]);

  return (
    <div className={[classes.main_container, status ? classes.slideIn : classes.slideOut].join(' ')}>
      {!loading && (
        <div className={classes.body}>
          <div className={classes.adInfo}>
            <img className={classes.img} src={currentInfo?.spotInfo.image_url || noImage} />

            <div className={classes.content}>
              <div className={[classes.ic, classes.ad_ic].join(' ')}>
                <FontAwesomeIcon icon={faQuestionCircle} />
              </div>
              <div className={classes.text}>
                <div className={classes.title}>Thông tin bảng quảng cáo</div>
                {currentInfo?.boardInfo.length > 0 ? (
                  <>
                    <div className={classes.type}>{currentInfo?.boardInfo[currentAdsIndex].type_name}</div>
                    <div className={classes.detail}>
                      <span className={classes.label}>Kích thước: </span>
                      {`${currentInfo?.boardInfo[currentAdsIndex].width} x ${currentInfo?.boardInfo[currentAdsIndex].height}`}
                    </div>
                    <div className={classes.detail}>
                      <span className={classes.label}>Số lượng: </span>
                      {currentInfo?.boardInfo.length > 0 && `1 trụ / ${currentInfo?.boardInfo.length} bảng`}
                    </div>
                    <div className={classes.detail}>
                      <span className={classes.label}>Hình thức: </span>
                      {currentInfo?.spotInfo.type_name}
                    </div>
                    <div className={classes.detail}>
                      <span className={classes.label}>Phân loại: </span>
                      {currentInfo?.spotInfo.location_type}
                    </div>

                    <div
                      className={[
                        classes.report,
                        currentInfo?.boardInfo[currentAdsIndex].reports > 0 && classes['report--haveReports'],
                      ].join(' ')}
                    >
                      <div className={classes.report__ic}>
                        <FontAwesomeIcon icon={faFlag} />
                      </div>
                      <div className={classes.report__text}>{`${
                        currentInfo?.boardInfo[currentAdsIndex].reports | 0
                      } báo cáo`}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={classes.type}>Chưa có dữ liệu</div>
                    <div className={classes.detail}>
                      <span className={classes.label}>Vui lòng chọn điểm trên bản đồ để xem.</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={classes.pagination}>
              {currentInfo?.boardInfo.length > 1 ? (
                <>
                  <div className={classes.pagination__divider} />
                  <div
                    className={[
                      classes.pagination__btn,
                      currentAdsIndex <= 0 && classes['pagination__btn--disabled'],
                    ].join(' ')}
                    onClick={() => setCurrentAdsIndex(currentAdsIndex - 1)}
                  >
                    <FontAwesomeIcon icon={faAngleLeft} />
                  </div>
                  <div className={classes.pagination__number}>{`${currentAdsIndex + 1}/${
                    currentInfo?.boardInfo.length
                  }`}</div>
                  <div
                    className={[
                      classes.pagination__btn,
                      currentAdsIndex >= currentInfo?.boardInfo.length - 1 && classes['pagination__btn--disabled'],
                    ].join(' ')}
                    onClick={() => setCurrentAdsIndex(currentAdsIndex + 1)}
                  >
                    <FontAwesomeIcon icon={faAngleRight} />
                  </div>
                  <div className={classes.pagination__divider} />
                </>
              ) : (
                <div className={classes.pagination__divider} />
              )}
            </div>
          </div>

          <div className={classes.spotInfo}>
            <div className={[classes.ic, classes.spot_ic].join(' ')}>
              <FontAwesomeIcon icon={faLocationDot} />
            </div>
            <div className={classes.text}>
              <div className={classes.title}>Thông tin địa điểm</div>
              <div className={classes.spot_name}>{spotName}</div>
              <div className={classes.spot_detail}>{spotAddress}</div>

              <div className={classes.reportAndPlan}>
                <div
                  className={[classes.report, currentInfo?.spotInfo.reports > 0 && classes['report--haveReports']].join(
                    ' '
                  )}
                >
                  <div className={classes.report__ic}>
                    <FontAwesomeIcon icon={faFlag} />
                  </div>
                  <div className={classes.report__text}>{`${currentInfo?.spotInfo.reports | 0} báo cáo`}</div>
                </div>

                <div
                  className={[classes.plan, !currentInfo?.spotInfo.is_planning && classes['plan--notPlanned']].join(
                    ' '
                  )}
                >
                  <div className={classes.plan__ic}>
                    <FontAwesomeIcon icon={currentInfo?.spotInfo.is_planning ? faCircleCheck : faCircleXmark} />
                  </div>
                  <div className={classes.plan__text}>
                    {(currentInfo?.spotInfo.is_planning ? 'Đã' : 'Chưa') + ' quy hoạch'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={classes.collapse_btn}
        onClick={() => {
          setCollapse && setCollapse(status);
          setStatus(!status);
        }}
      >
        <CollapseBtn status={status} />
      </div>
    </div>
  );
}
