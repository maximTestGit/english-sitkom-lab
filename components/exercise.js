import Captions from "./captions";
import EmbedVideo from "./embedVideo";

const Exercise = ({ video, selectVideo }) => {
    return (
        <>
            <button className="btn btn-success mb-3" onClick={() => selectVideo()}>Back</button>
            <div className="row">
                <div className="col-6">
                    <div className="row">
                        <EmbedVideo video={video} />
                    </div>
                </div>
                <div className="col-6">
                    <Captions videoId={video.videoId} />
                </div>
            </div>
        </>
    );
};

export default Exercise;