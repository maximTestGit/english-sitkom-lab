const VideoRow = ({ video, onSelectVideo }) => {
    return (
        <tr onClick={() => onSelectVideo(video)} style={{ opacity: video.enabled ? 1 : 0.5 }} >
            <td>
                <img src={video.thumbnail} alt={video.title} />
            </td>
            <td>{video.title}</td>
        </tr>
    );
};

export default VideoRow;