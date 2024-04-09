const EmbedVideo = ({ video }) => {
    return (
        <iframe width="851" height="479"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title} frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowFullScreen>
        </iframe>
    );
};

export default EmbedVideo;