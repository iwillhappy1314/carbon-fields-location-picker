<?php

namespace Carbon_Field_Location_Picker;

use Carbon_Fields\Field\Field;
use Carbon_Fields\Value_Set\Value_Set;

class Location_Picker_Field extends Field
{

	/**
	 * {@inheritDoc}
	 */
	protected $default_value = array(
		'province' => '110000',
		'city' => '110100',
		'district' => '110101',
		'address' => '',
		'lng' => '116.403752',
		'lat' => '39.924131',
		'show' => 0,
	);

	/**
	 * Create a field from a certain type with the specified label.
	 *
	 * @param string $type  Field type
	 * @param string $name  Field name
	 * @param string $label Field label
	 */
	public function __construct($type, $name, $label)
	{
		$this->set_value_set(new Value_Set(
			Value_Set::TYPE_MULTIPLE_PROPERTIES,
			array(
				'province' => '',
				'city' => '',
				'district' => '',
				'address' => '',
				'lng' => '',
				'lat' => '',
				'show' => 0
			)
		));
		parent::__construct($type, $name, $label);
	}

	/**
	 * Prepare the field type for use
	 * Called once per field type when activated
	 */
	public static function field_type_activated()
	{
		$dir = \Carbon_Field_Location_Picker\DIR . '/languages/';
		$locale = get_locale();
		$path = $dir . $locale . '.mo';
		load_textdomain('carbon-field-location-picker', $path);
	}

	/**
	 * Enqueue scripts and styles in admin
	 * Called once per field type
	 */
	public static function admin_enqueue_scripts()
	{
		$root_uri = \Carbon_Fields\Carbon_Fields::directory_to_url(\Carbon_Field_Location_Picker\DIR);

		$api_key = apply_filters('carbon_fields_baidu_map_field_api_key', false);
		$url = apply_filters('carbon_fields_map_field_api_url', '//api.map.baidu.com/api?v=2.0&ak=' . ($api_key ? $api_key : ''), $api_key);

		wp_enqueue_script('carbon-baidu-maps', $url, array(), null);

		// Enqueue field styles.
		wp_enqueue_style(
			'carbon-field-location-picker',
			$root_uri . '/build/bundle' . ((defined('SCRIPT_DEBUG') && SCRIPT_DEBUG) ? '' : '.min') . '.css'
		);

		// Enqueue field scripts.
		wp_enqueue_script(
			'carbon-field-location-picker-scripts',
			$root_uri . '/build/bundle' . ((defined('SCRIPT_DEBUG') && SCRIPT_DEBUG) ? '' : '.min') . '.js',
			array('carbon-fields-core', 'carbon-baidu-maps')
		);
	}

	/**
	 * Load the field value from an input array based on its name
	 *
	 * @param array $input Array of field names and values.
	 */
	public function set_value_from_input($input)
	{
		if (!isset($input[$this->get_name()])) {
			$this->set_value(null);
			return $this;
		}

		$value_set = array(
			'province' => '',
			'city' => '',
			'district' => '',
			'address' => '',
			'lng' => '',
			'lat' => '',
			'show' => 0,
		);

		foreach ($value_set as $key => $v) {
			if (isset($input[$this->get_name()][$key])) {
				$value_set[$key] = $input[$this->get_name()][$key];
			}
		}

		$value_set['lng'] = (string) $value_set['lng'];
		$value_set['lat'] = (string) $value_set['lat'];
		$value_set['show'] = 0;

		$this->set_value($value_set);

		return $this;
	}

	/**
	 * Returns an array that holds the field data, suitable for JSON representation.
	 *
	 * @param bool $load  Should the value be loaded from the database or use the value from the current instance.
	 * @return array
	 */
	public function to_json($load)
	{
		$field_data = parent::to_json($load);
		$value_set = $this->get_value();

		$field_data = array_merge($field_data, array(
			'value' => array(
				'province' => $value_set['province'],
				'city' => $value_set['city'],
				'district' => $value_set['district'],
				'address' => $value_set['address'],
				'lng' => $value_set['lng'],
				'lat' => $value_set['lat'],
				'show' => 0,
			),
		));

		return $field_data;
	}

	/**
	 * Set the coords and zoom of this field.
	 *
	 * @param  array $location  Latitude
	 * @return $this
	 */
	public function set_position($location)
	{
		return $this->set_default_value(array_merge(
			$this->get_default_value(),
			$location
		));
	}
}
