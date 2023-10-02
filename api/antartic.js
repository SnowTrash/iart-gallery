// Custom database containing artworks
const customArtworks = [
    {
      "title": "Artwork 1",
      "description": "Description of Artwork 1",
      "imagePath": "/path/to/image1.jpg"
    },
    {
      "title": "Artwork 2",
      "description": "Description of Artwork 2",
      "imagePath": "/path/to/image2.jpg"
    },
    // Add more artworks as needed
  ];
// Custom database containing artworks

// const customArtworks = require('./customArtworks.json');

const APIurl = "http://localhost/api_galeria.php?action=get_paintings";

module.exports = {
    fetchCustomList: async function () {

        
        const json = await fetch(APIurl).then(res => res.json());
        
        return json.data.filter((d) => d.image_id);
        // Fetch the list of artworks from your custom database
    },
    fetchCustomImage: async function (obj) {
        // Fetch image and title from your custom database
        return {
            title: obj.title + " - " + obj.description,
            // Assuming you have image paths in your custom database
            image: await fetch(obj.imagePath).then(res => res.blob())
        };
    }
};
