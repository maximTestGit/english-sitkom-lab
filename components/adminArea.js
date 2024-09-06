import { isRunningOnBigScreen } from './data/configurator';
import ConditionalButton from './helpers/conditionalButton.js';
import { loadCaptionObjectsFromFile } from './helpers/srtHelper.js';

const AdminArea = ({ onSrtOpen, onSrtSave, onUploadCaptions }) => {

    const btnCommonAttributes = 'btn-warning border border border-dark rounded col-3 col-md-1';
    const btnFontSize = isRunningOnBigScreen ? '0.7em' : '1em';

    const handleSrtOpen = () => {
        let fileName;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.srt';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                fileName = file.name;
                console.log('Selected file:', fileName);
                let captionsObject = await loadCaptionObjectsFromFile(file)
                if (onSrtOpen) {
                    onSrtOpen(captionsObject);
                }
            }
        };
        input.click();
    }

    const handleSrtSave = () => {
        onSrtSave();
    }

    const handleUploadCaptions = () => {
        onUploadCaptions();
    }
    return (
        <>
            <div id="AdminToolsArea" className="row mb-3 col-12 d-flex align-items-center">
                <ConditionalButton id="btnSrtSave"
                    className={`btn ${btnCommonAttributes}`}
                    hint={'Save current captions into SRT file'}
                    onClick={handleSrtSave}
                    fontSize={btnFontSize}
                >
                    {'Save .srt'}
                </ConditionalButton>
                <ConditionalButton id="btnSrtOpen"
                    className={`btn ${btnCommonAttributes}`}
                    hint={'Load captions from SRT file'}
                    onClick={handleSrtOpen}
                    fontSize={btnFontSize}
                >
                    {'Open .srt'}
                </ConditionalButton>
                <ConditionalButton id="btnSrtUpload"
                    className={`btn ${btnCommonAttributes}`}
                    hint={'Upload captions to Server'}
                    onClick={handleUploadCaptions}
                    fontSize={btnFontSize}
                >
                    {'Upload captions'}
                </ConditionalButton>
            </div>
        </>
    );
}

export default AdminArea;