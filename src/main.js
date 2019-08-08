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

    let map = new BMap.Map("allmap");
    map.addControl(new BMap.NavigationControl());    

    let geo = new BMap.Geocoder();
    let address = '北京市';

    console.log(location);
    
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
    geo.getPoint(address, function(point){      
        if (point) {
            value.lng = point.lng;
            value.lat = point.lat;
            map.centerAndZoom(point, 12);
        }
    }, data[location.province][location.city]);

    onChange(id, {
      ...value,
      ...location
    });
  };


  /**
   * 修改地址
   *
   * @param  {Object} e
   * @return {void}
   */
  handleAddressChange = debounce( ( address ) => {
    const { id, value, onChange, } = this.props;

    let map = new BMap.Map("allmap");
    map.addControl(new BMap.NavigationControl());    

    let geo = new BMap.Geocoder();
    
    if ( address !== '') {
			geo.getPoint(address, function(point){
        console.log(point);
          if (point) {
             value.lng = point.lng;
             value.lat = point.lat;
             map.centerAndZoom(point, 15);
          }
      }, data[value.province][value.city]);
    }

    onChange(id, {
      ...value,
      ...address
    });
	}, 350 )


  /**
   * Render a number input field.
   *
   * @return {Object}
   */
  render() {
    const { id, name, value, } = this.props;

    let city = data[value.province][value.city];

    console.log('render');
    console.log(value);

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
          center={value}
          zoom="10"
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


/**
 * The function that controls the stream of side-effects.
 *
 * @param  {Object} component
 * @return {Object}
 */
function aperture( component ) {
	const [ geocodeAddress$, geocodeAddress ] = component.useEvent( 'geocodeAddress' );

	const geocodeAddressProps$ = pipe(
		of( {
			onGeocodeAddress: geocodeAddress
		} ),
		map( toProps )
	);

	const geocodeAddressEffect$ = pipe(
		geocodeAddress$,
		map( ( payload ) => ( {
			type: 'GEOCODE_ADDRESS',
			payload: payload
		} ) )
	);

	return merge( geocodeAddressProps$, geocodeAddressEffect$ );
}

/**
 * The function that causes the side effects.
 *
 * @param  {Object} props
 * @return {Function}
 */
function handler( props ) {
	return function( effect ) {
		const { payload, type } = effect;
		const {
			id,
			value,
			onChange
		} = props;

		switch ( type ) {
			case 'GEOCODE_ADDRESS':
				const geocode = ( address ) => {
					return new Promise( ( resolve, reject ) => {
						const geocoder = new window.google.maps.Geocoder();

						geocoder.geocode( { address }, ( results, status ) => {
							if ( status === window.google.maps.GeocoderStatus.OK ) {
								const { location } = results[ 0 ].geometry;

								resolve( {
									lat: location.lat(),
									lng: location.lng()
								} );
							} else if ( status === 'ZERO_RESULTS' ) {
								reject( __( 'The address could not be found.', 'carbon-fields-ui' ) );
							} else {
								reject( `${ __( 'Geocode was not successful for the following reason: ', 'carbon-fields-ui' ) } ${ status }` );
							}
						} );
					} );
				};

				geocode( payload.address )
					.then( ( { lat, lng } ) => {
						onChange( id, {
							...value,
							address: payload.address,
							value: `${ lat },${ lng }`,
							lat,
							lng
						} );
					} )
					.catch( ( alert ) => {
						// eslint-disable-next-line
						console.log( __( 'Error alert', 'carbon-fields-ui' ) );

						// eslint-disable-next-line
						console.log( alert );
					} );

				break;
		}
	};
}

export default withEffects( aperture, { handler } )( LocationPickerField );