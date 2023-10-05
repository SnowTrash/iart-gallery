// Custom database containing artworks

// const customArtworks = require('./customArtworks.json');

const APIurl = "http://localhost/api_galeria_csv.php";

module.exports = {
    fetchList: async function () {        
        const json = await fetch(APIurl).then(res => res.json());
        
        return json.data.filter((d) => d.image_id);
        // Fetch the list of artworks from your custom database
    },
    fetchImage: async function (obj) {
        // Fetch image and title from your custom database
        // console.log("aqui manipulamos el obj en FetchImage---> " + obj.image);
         
        // Extract the file extension from the image path
        const fileExtension = obj.image.substring(obj.image.lastIndexOf('.') + 1);
          // Set the content type based on the file extension
        let contentType;
        if (fileExtension.toLowerCase() === 'jpg' || fileExtension.toLowerCase() === 'jpeg') {
            contentType = 'image/jpeg';
        } else if (fileExtension.toLowerCase() === 'png') {
            contentType = 'image/png';
        } else {
            // Handle other image formats if needed
            contentType = 'image/jpeg'; // Default to JPEG
        }
        
        // Assuming you have received the base64ImageData from the API response
        // const contentType = 'image/jpeg'; // Specify the correct content type

        const byteCharacters = atob(obj.image);
        const byteArrays = [];

        const sliceSize = 512;

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
        
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
          
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });

        return {
            title: obj.title + " - " + obj.artist_title,
            // Assuming you have image paths in your custom database    
            image: blob
        };
    }
};
