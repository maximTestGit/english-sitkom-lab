import React from 'react';
import { decodeHtml } from './helpers/presentationUtils.js';

const CaptionBox = ({ caption }) => {
    if (!caption) return null;

    return (
<table className={`table table-bordered text-center ${caption.checked ? "table-warning" : ""}`}>
    <tbody>
        <tr>
            <td className="fw-bold fs-5">
                {decodeHtml(caption.text)}
            </td>
        </tr>
    </tbody>
</table>    );
};

export default CaptionBox;