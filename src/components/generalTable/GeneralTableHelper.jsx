import React from 'react'

export const defaultColumnSorter = (fieldName) => (a, b) => {
    return a[fieldName]?.localeCompare(b[fieldName]) ?? 1;
}

export const numberColumnSorter = (fieldName) => (a, b) => {
    return a[fieldName] - b[fieldName];
}

export const dateColumnSorter = (fieldName) => (a, b) => {
    return new Date(a[fieldName]) - new Date(b[fieldName]);
}

