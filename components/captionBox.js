import React from 'react';
import { decodeHtml } from './helpers/presentationUtils.js';

const CaptionBox = ({ caption }) => {
    //if (!caption) return null;

    return (
        <table className={`table table-bordered text-center mt-1 ${caption?.checked ? "table-warning" : ""}`} style={{height: '80px'}}>
            <tbody>
                <tr>
                    <td className="fw-bold fs-6">
                        {caption && decodeHtml(caption?.text)}
                    </td>
                </tr>
            </tbody>
        </table>);
};

export default CaptionBox;