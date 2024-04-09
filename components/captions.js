import React, { useState, useEffect } from 'react';
import { fetchData } from './fetchData.js';

const Captions = ({video}) => {

    const [captions, setCaptions] = useState([]);

    useEffect(() => {
        const fetchCaptions = async () => {
            let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json?videoId=${video.videoId}`;
            const captionData = await fetchData('captions', url);
            setCaptions(captionData);
        };
        fetchCaptions();
    }, []);

    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th>Checked</th>
                    <th>Start(sec)</th>
                    <th>Text</th>
                </tr>
            </thead>
            <tbody>
                {captions && captions.map(caption => (
                    <tr key={caption.start}>
                        <td><input className="form-check-input" type="checkbox" checked={caption.checked} /></td>
                        <td>{caption.start}</td>
                        <td>{decodeHtml(caption.text)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

};

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

export default Captions;
