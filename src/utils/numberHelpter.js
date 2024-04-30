export const convertToNumber = (inputVal) => {
    if ( typeof (inputVal) === 'number') return inputVal;
    if (typeof (inputVal) === 'string') return parseFloat(inputVal)
    if (inputVal == null || inputVal == undefined || inputVal === '') return 0;
}