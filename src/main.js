/**
 * External dependencies.
 */
import { Component, Fragment } from '@wordpress/element';
import { BaiduMap, Marker, NavigationControl } from 'react-baidu-maps';

class LocationPickerField extends Component {
  /**
   * Handles the change of the input.
   *
   * @param  {Object} e
   * @return {void}
   */
  handleChange = (location) => {
    const { id, value, onChange, } = this.props;

    console.log(location);

    onChange(id, {
      ...value,
      ...location.point
    });

    value.show = 0;
  };


  /**
   * Render a number input field.
   *
   * @return {Object}
   */
  render() {
    const { id, name, value, } = this.props;

    return (
      <Fragment>

        <BaiduMap
          mapContainer={<div style={{ height: '300px' }} />}
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
