import React from 'react';

const ConditionalButton = ({ condition=true, 
        isDisabled=false,
        className, antiClassName=null, 
        onClick, antiOnClick=null, 
        children=null,
        antiChildren=null }) => 
    {
        let buttonClassName = (condition || !antiClassName) ? className : antiClassName;
        const buttonChildren = (condition || !antiChildren)? children : antiChildren;
        const buttonOnClick = (condition) ? onClick : antiOnClick;
        if (isDisabled) {
            buttonClassName = `${buttonClassName} disabled`;
        }

        return (
            <button className={buttonClassName} onClick={buttonOnClick}>
                {buttonChildren}
            </button>
        );
};

export default ConditionalButton;