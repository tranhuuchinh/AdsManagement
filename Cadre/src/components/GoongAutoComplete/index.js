import classes from './styles.module.scss';
import Select from 'react-select';
import { useState } from 'react';
import debounce from 'lodash.debounce';
import { colors, text } from '~styles/colors';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function GoongAutoComplete(props) {
  const { apiKey, onChange, defaultInputValue, placeholder, collapseSidebar, value, setValue } = props;
  const [options, setOptions] = useState();
  const [loading, setLoading] = useState(false);

  const borderColor = text.color_300;
  const borderColorFocus = text.color_500;

  const placeSearch = async (input) => {
    try {
      const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${apiKey}&input=${encodeURIComponent(input)}`;
      setLoading(true);
      const response = await fetch(url);
      const data = await response.json();
      if (data?.predictions?.length > 0) {
        const data2options = data.predictions.map((item) => ({
          value: item.description,
          label: item.description,
          place_id: item.place_id,
        }));
        setOptions(data2options);
      }
    } catch (error) {
      console.error('Goong auto complete error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = debounce((inputValue) => {
    if (!inputValue) return;
    placeSearch(inputValue);
  }, props.debounce | 700);

  return (
    <div className={classes.main_container}>
      <div className={classes.ic_container}>
        <FontAwesomeIcon icon={faSearch} />
      </div>
      <Select
        isClearable={true}
        isLoading={loading}
        defaultInputValue={defaultInputValue}
        value={value ? { value: value, label: value } : null}
        options={options}
        onInputChange={handleInputChange}
        onChange={(e) => {
          setValue(e?.label);
          onChange(e?.place_id);
        }}
        placeholder={placeholder || ''}
        styles={{
          control: (base, state) => ({
            ...base,
            height: '4.5rem',
            paddingLeft: '3rem',
            borderRadius: '100rem',
            fontSize: '1.5rem',
            backgroundColor: collapseSidebar || state.isFocused ? 'white' : 'rgba(255,255,255,.8)',
            borderColor: state.isFocused ? borderColorFocus : borderColor,
            boxShadow: state.isFocused ? `0 0 0 .5px ${borderColorFocus}` : 'none',
            '&:hover': {
              borderColor: borderColorFocus,
            },
          }),
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary25: colors.primary_200,
            primary: colors.primary_300,
          },
        })}
      />
    </div>
  );
}
