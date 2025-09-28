const themeToggle = document.querySelector(".theme-toggle");
const promptInput = document.querySelector(".prompt-input");
const promptForm = document.querySelector(".prompt-form");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");
const API_KEY = //"YOUR_API-KEY" 

const examplePrompts = [
  "Create an Ad Poster of An ice-cold 'Sprite' can bursting with lemon-lime fizz on a hot summer day, splashing water droplets, refreshing energy, vibrant green and yellow color palette, minimalistic ad poster style.",
  "Create an Ad Poster of Classic 'Coca-Cola' glass bottle with condensation, placed on a red-and-white checkered table with golden sunlight, festive and nostalgic theme, bold fonts, high contrast colors.",
  "Create an Ad Poster of A chilled bottle of 'Maaza' mango drink with mango slices and juice splash in the background, vibrant yellow-orange tones, tropical summer vibe, modern advertisement poster.",
  "Create an Ad Poster of A steaming hot bowl of 'Maggi' noodles with vegetables, placed on a rustic wooden table, cozy evening vibe, tagline '2-Minute Magic', playful fonts, bright yellow packaging theme",
  "Create an Ad Poster of A bar of 'Cadbury Dairy Milk' chocolate melting slightly, placed on a velvet purple cloth, romantic lighting, rich textures, bold tagline 'Kuch Meetha Ho Jaye' in stylish font.",
  "Create an Ad Poster of A red-themed poster with a 'KitKat' bar breaking apart mid-air, chocolate and wafer textures visible, white bold tagline 'Have a Break, Have a KitKat', high-energy background.",
  "Create an Ad Poster of A 'Horlicks' jar next to a glass of milk, set in a morning school setting, kid with backpack in the background, blue and white colors, tagline 'Taller, Stronger, Sharper', educational vibe.",
  "Create an Ad Poster of 'Mamaearth Sunscreen bottle' placed on a sandy beach with sunhat and sunglasses, SPF protection icons, orange and white aesthetic, clean design, 'Nature's Care for Your Skin' tagline.",
  "Create an Ad Poster of A sparkling toothbrush with 'Colgate' toothpaste and a shining smile in the background, bright bathroom lighting, red and white branding, tagline 'Strong Teeth, Fresh Breath'.",
  "Create an Ad Poster of A traditional yet elegant 'Mysore Sandal Soap' bar with sandalwood and flowers around, vintage Indian design, soft gold and earthy color tones, Ayurvedic theme, clean layout.",
  "Create an Ad Poster of A sleek 'iPhone 15 Pro' on a glossy dark surface with soft reflections, abstract tech background, minimalistic futuristic vibe, tagline 'Power. Elegance. iPhone.', sharp fonts.",
  "Create an Ad Poster of 'Noise neckband earphones' draped on a gym bag, neon-lit background, sporty and energetic theme, tagline 'Groove On the Go', black and neon blue color scheme.",
  "Create an Ad Poster of A pair of stylish 'Nike' running shoes mid-air with dust flying around, athletic person running in the background, bold caption 'Built for Performance', energetic lighting, modern typography."
];
(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark").matches;

    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className= isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

    return { width: calculatedWidth, height: calculatedHeight };
};

const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = `<img src="${imgUrl}" class="result-img" />
              <div class="img-overlay">
                <a href = "${imgUrl}" class="img-download-btn" download ="${Date.now()}.png" >
                  <i class="fa-solid fa-download"></i>
                </a>
              </div>`;
}
// send requests to hugging face API to create Poster
const generateImages = async (selectedModel, imagecount, aspectRatio, promptText) => {
    const MODEL_URL = ` https://api-inference.huggingface.co/models/${selectedModel}`;
    const {width, height} = getImageDimensions(aspectRatio);
    generateBtn.setAttribute("disabled", "true");

// create an array of image
    const imagePromises = Array.from({length: imagecount}, async(_,i) => {
        // send request to AI model API
        try{
            const response = await fetch (MODEL_URL,{
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "x-use-cache" : "false",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: {width, height},
                    
                }),
                
            });

            if(!response.ok) throw new Error((await response.json()) ?. error);

            // Convert response to image
            const result = await response.blob();
            updateImageCard(i, URL.createObjectURL(result)); 
        } catch (error){
            console.log(error);
            const imgCard = document.getElementById(`img-card-${i}`);
            imgCard.classList.replace("loading","error");
            imgCard.querySelector(".status-text").textContent = "Generation Failed! Check Console for more Details...";
        }
    })

    await Promise.allSettled(imagePromises);
    generateBtn.removeAttribute("disabled");
};

const createImageCards = (selectedModel, imagecount, aspectRatio, promptText) => {
gridGallery.innerHTML = "";

   for(let i=0;i < imagecount; i++){
    gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${aspectRatio}">
          <div class="status-container">
            <div class="spinner"></div>
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p class="status-text">Generating...</p>
          </div>
          </div>`;
}
    generateImages(selectedModel, imagecount, aspectRatio, promptText);
};

const handleFormSubmit = (e) => {
    e.preventDefault();


    const selectedModel = modelSelect.value;
    const imagecount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

    createImageCards(selectedModel, imagecount, aspectRatio, promptText);
}
promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);




