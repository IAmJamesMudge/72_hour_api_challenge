import axios from "axios";
import { create, UseBoundStore, StoreApi } from "zustand";
import { v4 as uuidv4 } from 'uuid';

const CAT_API_KEY = "live_CiocXWLutvw9yQwiNQlr1VnGTTdkHpX2uA7CFeruo2BAHRAr02TtwwjPj1FGYkkW";

const fakeDataJSON = '[{"breeds":[{"weight":{"imperial":"6 - 12","metric":"3 - 5"},"id":"bure","name":"Burmese","cfa_url":"http://cfa.org/Breeds/BreedsAB/Burmese.aspx","vetstreet_url":"http://www.vetstreet.com/cats/burmese","vcahospitals_url":"https://vcahospitals.com/know-your-pet/cat-breeds/burmese","temperament":"Curious, Intelligent, Gentle, Social, Interactive, Playful, Lively","origin":"Burma","country_codes":"MM","country_code":"MM","description":"Burmese love being with people, playing with them, and keeping them entertained. They crave close physical contact and abhor an empty lap. They will follow their humans from room to room, and sleep in bed with them, preferably under the covers, cuddled as close as possible. At play, they will turn around to see if their human is watching and being entertained by their crazy antics.","life_span":"15 - 16","indoor":0,"lap":1,"alt_names":"","adaptability":5,"affection_level":5,"child_friendly":4,"dog_friendly":5,"energy_level":4,"grooming":1,"health_issues":3,"intelligence":5,"shedding_level":3,"social_needs":5,"stranger_friendly":5,"vocalisation":5,"experimental":0,"hairless":0,"natural":0,"rare":0,"rex":0,"suppressed_tail":0,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Burmese_(cat)","hypoallergenic":1,"reference_image_id":"4lXnnfxac"}],"id":"Mdr6QqID0","url":"https://cdn2.thecatapi.com/images/Mdr6QqID0.jpg","width":1920,"height":1279},{"breeds":[{"weight":{"imperial":"5 - 10","metric":"2 - 5"},"id":"jbob","name":"Japanese Bobtail","cfa_url":"http://cfa.org/Breeds/BreedsCJ/JapaneseBobtail.aspx","vetstreet_url":"http://www.vetstreet.com/cats/japanese-bobtail","vcahospitals_url":"https://vcahospitals.com/know-your-pet/cat-breeds/japanese-bobtail","temperament":"Active, Agile, Clever, Easy Going, Intelligent, Lively, Loyal, Playful, Social","origin":"Japan","country_codes":"JP","country_code":"JP","description":"The Japanese Bobtail is an active, sweet, loving and highly intelligent breed. They love to be with people and play seemingly endlessly. They learn their name and respond to it. They bring toys to people and play fetch with a favorite toy for hours. Bobtails are social and are at their best when in the company of people. They take over the house and are not intimidated. If a dog is in the house, Bobtails assume Bobtails are in charge.","life_span":"14 - 16","indoor":0,"lap":1,"alt_names":"Japanese Truncated Cat","adaptability":5,"affection_level":5,"child_friendly":4,"dog_friendly":5,"energy_level":5,"grooming":1,"health_issues":1,"intelligence":5,"shedding_level":3,"social_needs":5,"stranger_friendly":5,"vocalisation":5,"experimental":0,"hairless":0,"natural":1,"rare":0,"rex":0,"suppressed_tail":1,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Japanese_Bobtail","hypoallergenic":0,"reference_image_id":"-tm9-znzl"}],"id":"RfdGhgEf3","url":"https://cdn2.thecatapi.com/images/RfdGhgEf3.jpg","width":1920,"height":1440},{"breeds":[{"weight":{"imperial":"5 - 10","metric":"2 - 5"},"id":"java","name":"Javanese","vetstreet_url":"http://www.vetstreet.com/cats/javanese","vcahospitals_url":"https://vcahospitals.com/know-your-pet/cat-breeds/javanese","temperament":"Active, Devoted, Intelligent, Playful","origin":"United States","country_codes":"US","country_code":"US","description":"Javanese are endlessly interested, intelligent and active. They tend to enjoy jumping to great heights, playing with fishing pole-type or other interactive toys and just generally investigating their surroundings. He will attempt to copy things you do, such as opening doors or drawers.","life_span":"10 - 12","indoor":0,"alt_names":" ","adaptability":4,"affection_level":5,"child_friendly":4,"dog_friendly":4,"energy_level":5,"grooming":1,"health_issues":3,"intelligence":5,"shedding_level":2,"social_needs":5,"stranger_friendly":3,"vocalisation":5,"experimental":0,"hairless":0,"natural":0,"rare":0,"rex":0,"suppressed_tail":0,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Javanese_cat","hypoallergenic":1,"reference_image_id":"xoI_EpOKe"}],"id":"xoI_EpOKe","url":"https://cdn2.thecatapi.com/images/xoI_EpOKe.jpg","width":1232,"height":1287},{"breeds":[{"weight":{"imperial":"7 - 11","metric":"3 - 5"},"id":"nebe","name":"Nebelung","temperament":"Gentle, Quiet, Shy, Playful","origin":"United States","country_codes":"US","country_code":"US","description":"The Nebelung may have a reserved nature, but she loves to play (being especially fond of retrieving) and enjoys jumping or climbing to high places where she can study people and situations at her leisure before making up her mind about whether she wants to get involved.","life_span":"11 - 16","indoor":0,"lap":1,"alt_names":"Longhaired Russian Blue","adaptability":5,"affection_level":5,"child_friendly":4,"dog_friendly":4,"energy_level":3,"grooming":3,"health_issues":2,"intelligence":5,"shedding_level":3,"social_needs":3,"stranger_friendly":3,"vocalisation":1,"experimental":0,"hairless":0,"natural":0,"rare":1,"rex":0,"suppressed_tail":0,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Nebelung","hypoallergenic":0,"reference_image_id":"OGTWqNNOt"}],"id":"FTd8l4EXq","url":"https://cdn2.thecatapi.com/images/FTd8l4EXq.jpg","width":2880,"height":1800},{"breeds":[{"weight":{"imperial":"7 - 11","metric":"3 - 5"},"id":"nebe","name":"Nebelung","temperament":"Gentle, Quiet, Shy, Playful","origin":"United States","country_codes":"US","country_code":"US","description":"The Nebelung may have a reserved nature, but she loves to play (being especially fond of retrieving) and enjoys jumping or climbing to high places where she can study people and situations at her leisure before making up her mind about whether she wants to get involved.","life_span":"11 - 16","indoor":0,"lap":1,"alt_names":"Longhaired Russian Blue","adaptability":5,"affection_level":5,"child_friendly":4,"dog_friendly":4,"energy_level":3,"grooming":3,"health_issues":2,"intelligence":5,"shedding_level":3,"social_needs":3,"stranger_friendly":3,"vocalisation":1,"experimental":0,"hairless":0,"natural":0,"rare":1,"rex":0,"suppressed_tail":0,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Nebelung","hypoallergenic":0,"reference_image_id":"OGTWqNNOt"}],"id":"GwRBXx7-w","url":"https://cdn2.thecatapi.com/images/GwRBXx7-w.jpg","width":1280,"height":853},{"breeds":[{"weight":{"imperial":"5 - 10","metric":"2 - 5"},"id":"orie","name":"Oriental","cfa_url":"http://cfa.org/Breeds/BreedsKthruR/Oriental.aspx","vetstreet_url":"http://www.vetstreet.com/cats/oriental","vcahospitals_url":"https://vcahospitals.com/know-your-pet/cat-breeds/oriental","temperament":"Energetic, Affectionate, Intelligent, Social, Playful, Curious","origin":"United States","country_codes":"US","country_code":"US","description":"Orientals are passionate about the people in their lives. They become extremely attached to their humans, so be prepared for a lifetime commitment. When you are not available to entertain her, an Oriental will divert herself by jumping on top of the refrigerator, opening drawers, seeking out new hideaways.","life_span":"12 - 14","indoor":0,"lap":1,"alt_names":"Foreign Type","adaptability":5,"affection_level":5,"child_friendly":4,"dog_friendly":5,"energy_level":5,"grooming":1,"health_issues":3,"intelligence":5,"shedding_level":3,"social_needs":5,"stranger_friendly":3,"vocalisation":5,"experimental":0,"hairless":0,"natural":0,"rare":0,"rex":0,"suppressed_tail":0,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Oriental_Shorthair","hypoallergenic":1,"reference_image_id":"LutjkZJpH"}],"id":"xbW2bsXfK","url":"https://cdn2.thecatapi.com/images/xbW2bsXfK.jpg","width":2448,"height":3264},{"breeds":[{"weight":{"imperial":"12 - 20","metric":"5 - 9"},"id":"ragd","name":"Ragdoll","cfa_url":"http://cfa.org/Breeds/BreedsKthruR/Ragdoll.aspx","vetstreet_url":"http://www.vetstreet.com/cats/ragdoll","vcahospitals_url":"https://vcahospitals.com/know-your-pet/cat-breeds/ragdoll","temperament":"Affectionate, Friendly, Gentle, Quiet, Easygoing","origin":"United States","country_codes":"US","country_code":"US","description":"Ragdolls love their people, greeting them at the door, following them around the house, and leaping into a lap or snuggling in bed whenever given the chance. They are the epitome of a lap cat, enjoy being carried and collapsing into the arms of anyone who holds them.","life_span":"12 - 17","indoor":0,"lap":1,"alt_names":"Rag doll","adaptability":5,"affection_level":5,"child_friendly":4,"dog_friendly":5,"energy_level":3,"grooming":2,"health_issues":3,"intelligence":3,"shedding_level":3,"social_needs":5,"stranger_friendly":3,"vocalisation":1,"experimental":0,"hairless":0,"natural":0,"rare":0,"rex":0,"suppressed_tail":0,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Ragdoll","hypoallergenic":0,"reference_image_id":"oGefY4YoG"}],"id":"QZYN75HxN","url":"https://cdn2.thecatapi.com/images/QZYN75HxN.jpg","width":1024,"height":768},{"breeds":[{"weight":{"imperial":"12 - 18","metric":"5 - 8"},"id":"mcoo","name":"Maine Coon","cfa_url":"http://cfa.org/Breeds/BreedsKthruR/MaineCoon.aspx","vetstreet_url":"http://www.vetstreet.com/cats/maine-coon","vcahospitals_url":"https://vcahospitals.com/know-your-pet/cat-breeds/maine-coon","temperament":"Adaptable, Intelligent, Loving, Gentle, Independent","origin":"United States","country_codes":"US","country_code":"US","description":"They are known for their size and luxurious long coat Maine Coons are considered a gentle giant. The good-natured and affable Maine Coon adapts well to many lifestyles and personalities. She likes being with people and has the habit of following them around, but isn’t needy. Most Maine Coons love water and they can be quite good swimmers.","life_span":"12 - 15","indoor":0,"lap":1,"alt_names":"Coon Cat, Maine Cat, Maine Shag, Snowshoe Cat, American Longhair, The Gentle Giants","adaptability":5,"affection_level":5,"child_friendly":4,"dog_friendly":5,"energy_level":3,"grooming":3,"health_issues":3,"intelligence":5,"shedding_level":3,"social_needs":3,"stranger_friendly":5,"vocalisation":1,"experimental":0,"hairless":0,"natural":1,"rare":0,"rex":0,"suppressed_tail":0,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Maine_Coon","hypoallergenic":0,"reference_image_id":"OOD3VXAQn"}],"id":"OCoeP14wW","url":"https://cdn2.thecatapi.com/images/OCoeP14wW.jpg","width":630,"height":817},{"breeds":[{"weight":{"imperial":"6 - 12","metric":"3 - 5"},"id":"tonk","name":"Tonkinese","cfa_url":"http://cfa.org/Breeds/BreedsSthruT/Tonkinese.aspx","vetstreet_url":"http://www.vetstreet.com/cats/tonkinese","vcahospitals_url":"https://vcahospitals.com/know-your-pet/cat-breeds/tonkinese","temperament":"Curious, Intelligent, Social, Lively, Outgoing, Playful, Affectionate","origin":"Canada","country_codes":"CA","country_code":"CA","description":"Intelligent and generous with their affection, a Tonkinese will supervise all activities with curiosity. Loving, social, active, playful, yet content to be a lap cat","life_span":"14 - 16","indoor":0,"lap":1,"alt_names":"Tonk","adaptability":5,"affection_level":5,"child_friendly":4,"dog_friendly":5,"energy_level":5,"grooming":1,"health_issues":1,"intelligence":5,"shedding_level":3,"social_needs":5,"stranger_friendly":5,"vocalisation":5,"experimental":0,"hairless":0,"natural":0,"rare":0,"rex":0,"suppressed_tail":0,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Tonkinese_(cat)","hypoallergenic":0,"reference_image_id":"KBroiVNCM"}],"id":"pB_IDnwMf","url":"https://cdn2.thecatapi.com/images/pB_IDnwMf.jpg","width":1080,"height":1080},{"breeds":[{"weight":{"imperial":"7 - 20","metric":"3 - 9"},"id":"tvan","name":"Turkish Van","cfa_url":"http://cfa.org/Breeds/BreedsSthruT/TurkishVan.aspx","vetstreet_url":"http://www.vetstreet.com/cats/turkish-van","vcahospitals_url":"https://vcahospitals.com/know-your-pet/cat-breeds/turkish-van","temperament":"Agile, Intelligent, Loyal, Playful, Energetic","origin":"Turkey","country_codes":"TR","country_code":"TR","description":"While the Turkish Van loves to jump and climb, play with toys, retrieve and play chase, she is is big and ungainly; this is one cat who doesn’t always land on his feet. While not much of a lap cat, the Van will be happy to cuddle next to you and sleep in your bed. ","life_span":"12 - 17","indoor":0,"alt_names":"Turkish Cat, Swimming cat","adaptability":5,"affection_level":5,"child_friendly":4,"dog_friendly":5,"energy_level":5,"grooming":2,"health_issues":1,"intelligence":5,"shedding_level":3,"social_needs":4,"stranger_friendly":4,"vocalisation":5,"experimental":0,"hairless":0,"natural":1,"rare":0,"rex":0,"suppressed_tail":0,"short_legs":0,"wikipedia_url":"https://en.wikipedia.org/wiki/Turkish_Van","hypoallergenic":0,"reference_image_id":"sxIXJax6h"}],"id":"2OKotXbFe","url":"https://cdn2.thecatapi.com/images/2OKotXbFe.jpg","width":1080,"height":1350}]'


const mode:"PRODUCTION"|"DEVELOPMENT" = "DEVELOPMENT";

type NavigationData = {
    prev:string;
    next:string;
}

export type CatPicData = {
    id:string;
    width:number;
    height:number;
    url:string;
    breeds:BreedData[]
}
export type BreedData = {
    weight:any;
    id:string;
    name:string;
    temperament:string;
    origin:string;
    life_span:string;
    wikipedia_url:string;
}
interface CatStore 
{
    cache:CatPicData[];
    // the reverse look up takes an image id and gives the index of that image in the cache
    reverseCacheLookup: {[key:string]:number};
    isLoading:boolean;
    loadImages:(count:number) => Promise<void>;
    allBreeds:BreedData[];
    remove:(item:CatPicData) => void;
}

function PushImage(store:CatStore, picData:CatPicData) 
{
    let index = store.cache.length;
    let id = picData.id;

    store.cache.push(picData);
    store.reverseCacheLookup[id] = index;
}

const useCatStore = create<CatStore>(
    (set, get) => ({
        cache: [],
        reverseCacheLookup: {},
        allBreeds: [],
        isLoading: false,
        remove: (item) => {
            let mutableState = JSON.parse(JSON.stringify(get())) as CatStore;
            let index = mutableState.reverseCacheLookup[item.id];
            if (index != undefined) 
            {
                mutableState.cache.splice(index,1,null as any);
                delete mutableState.reverseCacheLookup[item.id];
            }

            console.log("Data set to:", mutableState);

            set(mutableState);
        },
        loadImages: async (count) => {
            let state = get();

            if (state.isLoading) {
                return;
            }

            set(st => {
                //NOTE: consider using immer.js for optimized immutable state updates
                let mutableState = JSON.parse(JSON.stringify(st)) as CatStore;
                mutableState.isLoading = true;
                return mutableState;
             });

             if (mode == "DEVELOPMENT") {

                await new Promise(resolve => setTimeout(resolve,2000));
                set((st) => {
                    let mutableState = JSON.parse(JSON.stringify(st)) as CatStore;
                    let newImages = JSON.parse(fakeDataJSON) as CatPicData[];
                    while (newImages.length < count) {
                        let moreImages = JSON.parse(fakeDataJSON) as CatPicData[];
                        newImages = [...newImages, ...moreImages];
                    }

                    mutableState.isLoading = false;
                    
                    for (let x = 0; x < newImages.length; x++) {
                        // ensure fake image data has unique ids
                        newImages[x].id = uuidv4();
                        PushImage(mutableState, newImages[x]);
                    }

                    return mutableState;
                })
                return;
             }

             try {
                let response = await axios.get(`https://api.thecatapi.com/v1/images/search?limit=${count}&has_breeds=1`, {
                    headers: {
                        "x-api-key": CAT_API_KEY
                    }
                });

                console.log("RESPONSE:", response);
                
                let newImages = response.data as CatPicData[];
                set((st) => {
                    let mutableState = JSON.parse(JSON.stringify(st)) as CatStore;
                    mutableState.isLoading = false;
                    
                    for (let x = 0; x < newImages.length; x++) {
                        PushImage(mutableState, newImages[x]);
                    }

                    return mutableState;
                })

             } catch (error) {
                throw error;
             }

        }
    }
))

const catLines = [
    "Stay PAWsitive!",
    "You’ve got to be kitten me.",
    "Happy Purr-thday!",
    "I’m just kitten around.",
    "I think we should get meow-rried someday.",
    "That’s just claw-ful.",
    "You’re a fur-midable opponent.",
    "I’m so fur-tunate.",
    "Let me tell you a tail.",
    "That’s a paw-sibility.",
    "My cat is my best fur-end.",
    "That’s hiss-terical.",
    "He’ll go down in hiss-tory.",
    "You’ve got to be kitten me.",
    "Paw-don me.",
    "You look fur-miliar.",
    "That’s paw-some.",
    "Don’t fur-get to buy more catnip.",
    "I’ll love my cat fur-ever.",
    "That was a cat-astrophe.",
    "My cat is radi-claw.",
    "Dogs are in-furior to cats.",
    "I’m feline sad.",
    "You’ve got purr-sonality.",
    "Look at that meowntain.",
    "My cat is totally litter-ate.",
    "Whisker me away.",
    "I’m a glamourpuss.",
    "You’re so purr-suasive.",
    "My favorite color is purr-ple.",
    "Don’t be a sourpuss.",
    "Like my paw-jamas?",
    "Better call in claw-enforcement.",
    "I’ll have a meow-tini.",
    "I’m feline good.",
    "I need to take a paws.",
    "How claw-some is that?",
    "Can I paw-lease have that?",
    "I've got cattitude.",
    "Take meowt for lunch.",
    "I love my cat the meowst.",
    "I’ve done that be-fur.",
    "My cat is super cathletic.",
    "Never, efur do that again.",
    "Purr-haps we can cuddle later.",
    "My cat is so purr-ty.",
    "My cat wants a Furr-ari.",
    "I've got my thinking cat on.",
    "Wait a meow-ment.",
]
// fake api endpoint for some cat facts
export function GetRandomCatLine() {
    let index = Math.floor(Math.random()*catLines.length)

    return catLines[index];
}

export default useCatStore;