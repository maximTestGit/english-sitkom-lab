import React from 'react';

const ConditionalButton = ({ condition = true,
    isDisabled = false,
    className, antiClassName = null,
    onClick, antiOnClick = null,
    hint = null,
    children = null,
    antiChildren = null,
    dataToggle = null, dataTarget = null }) => {
    let buttonClassName = (condition || !antiClassName) ? className : antiClassName;
    const buttonChildren = (condition || !antiChildren) ? children : antiChildren;
    const buttonOnClick = (condition) ? onClick : antiOnClick;
    if (isDisabled) {
        buttonClassName = `${buttonClassName} disabled`;
    }

    return (
        <button className={buttonClassName}
            {...(dataToggle && { 'data-toggle': dataToggle })}
            {...(dataTarget && { 'data-target': dataTarget })}
            data-bs-toggle="tooltip" data-bs-placement="top" title={hint ? hint : children}
            onClick={buttonOnClick}>
            {buttonChildren}
        </button>
    );
};

export default ConditionalButton;