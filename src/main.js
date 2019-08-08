/**
 * External dependencies.
 */
import of from 'callbag-of';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withEffects, toProps } from 'refract-callbag';
import { debounce } from 'lodash';
import {
	map,
	pipe,
	merge
} from 'callbag-basics';

import { BaiduMap, Marker, NavigationControl } from 'react-baidu-maps';
import CityPicker from 'react-city-picker'
import data from '../node_modules/china-area-data/data';
import SearchInput from './search-input';
import BMap from 'BMap'

class LocationPickerField extends Component {

  /**
   * 在地图上拖动图钉选择地点
   *
   * @param  {Object} e
   * @return {void}
   */
  handleChange = (location) => {
    const { id, value, onChange, } = this.props;

    onChange(id, {
      ...value,
      ...location.point
    });

    value.show = 0;
  };


  /**
   * 修改城市
   *
   * @param  {Object} e
   * @return {void}
   */
  handleCityChange = (location) => {
    const { id, value, onChange, } = this.props;

    let map = this.refs.BMap;
    let geo = new BMap.Geocoder();
    let address = '北京市';
    let el = this;
    
    if(location.province !== ''){
      address = data['86'][location.province];
    }

    if(location.city !== ''){
      address = data['86'][location.province] + data[location.province][location.city];
    }

    if(location.district !== ''){
      address = data['86'][location.province] +
              data[location.province][location.city] + 
              data[location.city][location.district];
    }

    // 解析地址为坐标
    this.setAddress(address);

    onChange(id, {
      ...value,
      ...location
    });

    this.forceUpdate();

  };


  /**
   * 修改地址
   *
   * @param  {Object} e
   * @return {void}
   */
  handleAddressChange = debounce( ( address ) => {
    const { id, value, onChange, } = this.props;

    this.setAddress(address);

    onChange(id, {
      ...value,
      ...address
    });

  }, 350 )
  

  /**
   * 解析地址，修改中心点和 marker 位置
   *
   * @param  {Object} e
   * @return {void}
   */
  setAddress = (address) => {
    const { id, value, onChange, } = this.props;

    let map = this.refs.BMap;
    let geo = new BMap.Geocoder();
    let el = this;

    if(address !== ''){
      geo.getPoint(address, function (point) {
        if (point) {
          map.centerAndZoom(point, 15);

          el.props.value.lng = point.lng;
          el.props.value.lat = point.lat;
        }
      }, data[value.province][value.city]);
    }
  
  }


  /**
   * Render a number input field.
   *
   * @return {Object}
   */
  render() {
    const { id, name, value, } = this.props;

    return (
      <Fragment>

        <div className="rs-location">

          <CityPicker
            id={id}
            className="rs-location_city"
            source={data}
            selectedProvince={value.province}
            selectedCity={value.city}
            selectedDistrict={value.district}
            onOptionChange={this.handleCityChange} />

          <SearchInput
            id={ id }
            className="rs-location__address"
            name={ `${ name }[address]` }
            value={ value.address }
            onChange={ this.handleAddressChange }
          />

        </div>

        <BaiduMap
          mapContainer={<div style={{ height: '360px' }} />}
          ref="BMap"
          center={value}
          zoom="15"
        >
          <NavigationControl anchor="top_right" />

          <Marker
            position={value}
            enableDragging="true"
            onDragend={this.handleChange}
          />
        </BaiduMap>

        <input
          type="hidden"
          name={`${name}[province]`}
          value={value.province}
        />

        <input
          type="hidden"
          name={`${name}[city]`}
          value={value.city}
          readOnly
        />

        <input
          type="hidden"
          name={`${name}[district]`}
          value={value.district}
          readOnly
        />

        <input
          type="hidden"
          name={`${name}[lng]`}
          value={value.lng}
          readOnly
        />

        <input
          type="hidden"
          name={`${name}[lat]`}
          value={value.lat}
          readOnly
        />

        <input
          type="hidden"
          name={`${name}[show]`}
          value='0'
          readOnly
        />

      </Fragment >
    );
  }
}

export default LocationPickerField;