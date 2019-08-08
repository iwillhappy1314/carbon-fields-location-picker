/**
 * External dependencies.
 */
import { registerFieldType } from '@carbon-fields/core';

/**
 * Internal dependencies.
 */
import './style.scss';
import LocationPickerField from './main';

registerFieldType('location_picker', LocationPickerField );
