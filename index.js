// Import the CreativeEngine SDK from CDN
import CreativeEngine from "https://cdn.img.ly/packages/imgly/cesdk-engine/1.42.0/index.js";

// Configuration object with license key and assets location
const LICENSE_KEY = "YOUR_LICENSE_KEY";

const config = {
  license: LICENSE_KEY,
  baseURL: "https://cdn.img.ly/packages/imgly/cesdk-engine/1.42.0/assets",
};

// Creates a video block element with the specified video file and duration
async function createVideoBlock(engine, fileURI, duration) {
  // Create a graphic block that will contain the video
  const video = engine.block.create("graphic");
  // Set the shape to rectangle
  engine.block.setShape(video, engine.block.createShape("rect"));
  // Create a video fill and set its source file
  const videoFill = engine.block.createFill("video");
  engine.block.setString(videoFill, "fill/video/fileURI", fileURI);
  engine.block.setFill(video, videoFill);
  // Set how long this video should play
  engine.block.setDuration(video, duration);
  return { video, videoFill };
}

// Configure the second video with trim settings and fade-in animation
async function setupSecondVideo(engine, videoFill2, video2) {
  // Ensure video is loaded before manipulating
  await engine.block.forceLoadAVResource(videoFill2);
  // Start video 1 second in
  engine.block.setTrimOffset(videoFill2, 1);
  // Play for 4 seconds
  engine.block.setTrimLength(videoFill2, 4);
  
  // Add a fade-in animation effect
  const fadeInAnimation = engine.block.createAnimation("fade");
  engine.block.setInAnimation(video2, fadeInAnimation);
}

// Add background music to the composition
function setupAudio(engine, page) {
  // Create an audio block
  const audio = engine.block.create("audio");
  engine.block.appendChild(page, audio);
  // Set the audio file source
  engine.block.setString(
    audio,
    "audio/fileURI",
    "https://cdn.img.ly/assets/demo/v1/ly.img.audio/audios/far_from_home.m4a"
  );
  // Set volume to 80%
  engine.block.setVolume(audio, 0.8);
  // Start audio 1 second in
  engine.block.setTimeOffset(audio, 1);
  // Play for 5 seconds
  engine.block.setDuration(audio, 5);
  return audio;
}

// Add text overlay to the video
function setupText(engine, page) {
  // Create a text block
  const text = engine.block.create("text");
  // Set the text content with line breaks
  engine.block.replaceText(text, "Surfing\nis\nCOOL!");
  // Set text color to semi-transparent white
  engine.block.setTextColor(text, { r: 255.0, g: 255.0, b: 255.0, a: 0.8 });
  // Set font size
  engine.block.setTextFontSize(text, 30);
  
  // Make text box automatically size to content
  engine.block.setWidthMode(text, "Auto");
  engine.block.setHeightMode(text, "Auto");
  // Position text on screen
  engine.block.setPositionX(text, 130);
  engine.block.setPositionY(text, 800);
  
  // Add text to the page
  engine.block.appendChild(page, text);
  return text;
}

// Create a track to sequence the videos
function createTrack(engine, page, video1, video2) {
  // Create a track to hold videos in sequence
  const track = engine.block.create("track");
  engine.block.appendChild(page, track);
  // Add videos in order
  engine.block.appendChild(track, video1);
  engine.block.appendChild(track, video2);
  // Make track fill the page
  engine.block.fillParent(track);
  return track;
}

// Export the final video composition
async function exportVideo(engine, page) {
  const mimeType = "video/mp4";
  // Callback to log export progress
  const progressCallback = (renderedFrames, encodedFrames, totalFrames) => {
    console.log(
      "Rendered",
      renderedFrames,
      "frames and encoded",
      encodedFrames,
      "frames out of",
      totalFrames
    );
  };

  // Configure export settings
  const videoOptions = {
    duration: 10,
    framerate: 30,
    targetWidth: 480,
    targetHeight: 852,
  };

  // Export the video
  const blob = await engine.block.exportVideo(
    page,
    mimeType,
    progressCallback,
    videoOptions
  );

  // Create download link for exported video
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = "video.mp4";
  anchor.click();
}

// Initialize the Creative Engine and create the video composition
CreativeEngine.init(config).then(async (engine) => {
  // Add the editor to the page
  document.getElementById("cesdk_container").append(engine.element);

  // Create the main scene and page
  const scene = engine.scene.createVideo();
  const page = engine.block.create("page");
  engine.block.appendChild(scene, page);

  // Set page dimensions (portrait video)
  engine.block.setWidth(page, 720);
  engine.block.setHeight(page, 1280);
  engine.block.setDuration(page, 10);

  // Create first video - surfing footage
  const { video: video1 } = await createVideoBlock(
    engine,
    "https://cdn.img.ly/assets/demo/v2/ly.img.video/videos/pexels-drone-footage-of-a-surfer-barrelling-a-wave-12715991.mp4",
    7
  );

  // Create second video - beach footage
  const { video: video2, videoFill: videoFill2 } = await createVideoBlock(
    engine,
    "https://cdn.img.ly/assets/demo/v2/ly.img.video/videos/pexels-kampus-production-8154913.mp4",
    3
  );

  // Configure the second video
  await setupSecondVideo(engine, videoFill2, video2);
  
  // Add audio, text, and create video track
  setupAudio(engine, page);
  setupText(engine, page);
  createTrack(engine, page, video1, video2);
  
  // Export the final video
  await exportVideo(engine, page);
});
