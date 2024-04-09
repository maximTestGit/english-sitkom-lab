import React, { useState, useEffect } from 'react';

const Captions = ({video}) => {

    const [captions, setCaptions] = useState([]);

    useEffect(() => {
        const fetchCaptions = async () => {
            let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json?videoId=${video.videoId}`;
            const response = await fetch(url);
            const captions = await response.json();
            setCaptions(captions);
        };
        fetchCaptions();
    }, []);

    return (
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Checked</th>
                    <th>Start(sec)</th>
                    <th>Text</th>
                </tr>
            </thead>
            <tbody>
                {captions.map(caption => (
                    <tr key={caption.start}>
                        <td><input class="form-check-input" type="checkbox" checked={caption.checked} /></td>
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
