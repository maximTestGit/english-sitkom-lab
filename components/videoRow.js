const VideoRow = ({ video, selectVideo }) => {
    return (
        <tr>
            <td>
                <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
                    <img src={video.thumbnail} alt={video.title} />
                </a>
            </td>
            <td onClick={() => selectVideo(video)}>{video.title}</td>
            <td>{video.description}</td>
        </tr>
    );
};

export default VideoRow;