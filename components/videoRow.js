const VideoRow = ({ video, selectVideo }) => {
    return (
        <tr onClick={() => selectVideo(video)}>
            <td>
                <img src={video.thumbnail} alt={video.title} />
            </td>
            <td>{video.title}</td>
            <td>{video.description}</td>
        </tr>
    );
};

export default VideoRow;