import React from 'react';

const ConditionalButton = ({ 
    condition = true,
    isDisabled = false,
    className, 
    antiClassName = null,
    onClick, 
    antiOnClick = null,
    hint = null,
    children = null,
    antiChildren = null,
    dataToggle = null, 
    dataTarget = null,
    fontSize = '1.0em'
    }) => { 
    let buttonClassName = (condition || !antiClassName) ? className : antiClassName;
    const buttonChildren = (condition || !antiChildren) ? children : antiChildren;
    const buttonOnClick = (condition || !antiOnClick) ? onClick : antiOnClick;
    if (isDisabled) {
        buttonClassName = `${buttonClassName} disabled`;
    }
    const buttonClickWrapper = (e) => {
        console.log(`LingFlix: ConditionalButton: buttonClick "${buttonChildren}"`);
        buttonOnClick();
    };
    return (
        <button className={buttonClassName}
            style={{ fontSize: fontSize }}
            {...(dataToggle && { 'data-toggle': dataToggle })}
            {...(dataTarget && { 'data-target': dataTarget })}
            data-bs-toggle="tooltip" data-bs-placement="top" title={hint ? hint : children}
            onClick={buttonClickWrapper}
            >  
            {buttonChildren}
        </button>
    );
};

export default ConditionalButton;