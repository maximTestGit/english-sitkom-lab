const VideoRow = ({ video, onSelectVideo }) => {
    return (
        <tr onClick={() => onSelectVideo(video)}>
            <td>
                <img src={video.thumbnail} alt={video.title} />
            </td>
            <td>{video.title}</td>
            <td>{video.description}</td>
        </tr>
    );
};

export default VideoRow;