<?php
use Carbon_Fields\Carbon_Fields;
use Carbon_Field_Location_Picker\Location_Picker_Field;

define( 'Carbon_Field_Location_Picker\\DIR', __DIR__ );

Carbon_Fields::extend( Location_Picker_Field::class, function( $container ) {
	return new Location_Picker_Field( $container['arguments']['type'], $container['arguments']['name'], $container['arguments']['label'] );
} );