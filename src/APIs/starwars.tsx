import { Popover, Card, Button } from "antd";
import { ColumnsType } from "antd/es/table";
import axios from "axios";
import { create, UseBoundStore, StoreApi } from "zustand";



export type StoreType = "peopleStore" | "planetStore" | "vehicleStore" | "speciesStore" | "filmStore" | "starshipStore";

export interface SWBaseAPIRecord {
  created:string;
  edited:string;
  url:string;
}
export interface People extends SWBaseAPIRecord {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films?: (string)[] | null;
  species?: (null)[] | null;
  vehicles?: (string)[] | null;
  starships?: (string)[] | null;
}

export interface Planet  extends SWBaseAPIRecord {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents?: (string)[] | null;
  films?: (string)[] | null;
}

export interface Starship  extends SWBaseAPIRecord {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  hyperdrive_rating: string;
  MGLT: string;
  starship_class: string;
  pilots?: (null)[] | null;
  films?: (string)[] | null;
}

export interface Species  extends SWBaseAPIRecord {
  name: string;
  classification: string;
  designation: string;
  average_height: string;
  skin_colors: string;
  hair_colors: string;
  eye_colors: string;
  average_lifespan: string;
  homeworld: string;
  language: string;
  people?: (string)[] | null;
  films?: (string)[] | null;
}

export interface Vehicle extends SWBaseAPIRecord {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  vehicle_class: string;
  pilots?: (null)[] | null;
  films?: (string)[] | null;
}

export interface Film extends SWBaseAPIRecord {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters?: (string)[] | null;
  planets?: (string)[] | null;
  starships?: (string)[] | null;
  vehicles?: (string)[] | null;
  species?: (string)[] | null;
}


export interface SWStore<T extends SWBaseAPIRecord> 
{
  cache:(T|null|undefined)[];
  maxCount:number;
  add:(item:T, id:number) => void;
  addMultiple:(items:T[]) => void;
  remove:(id:number) => void;
  get:(id:number, forceRetrieve:boolean) => Promise<void>;
  getPage:(pageNumber:number, forceRetrieve:boolean) => Promise<void>;
  previouslyRequestedPages: number[];
  previouslySearchedStrings:string[];
  searchFor:(search:string) => Promise<void>
}

const apiBaseEndpoints = {
  people: "https://swapi.dev/api/people",
  planets: "https://swapi.dev/api/planets",
  starships: "https://swapi.dev/api/starships",
  species: "https://swapi.dev/api/species",
  vehicles: "https://swapi.dev/api/vehicles",
  films: "https://swapi.dev/api/films"
};

// Gets the ID of a record from the url.
// all individual record URLs from this api are of the form
// https://swapi.dev/api/{category}/{id}
// thus, we need only extract the last number from this string to get the record id
export function ExtractID(url:string) 
{
  let match = url.match(/(\d+)(?!.*\d)/);
  if (match) 
  {
    return parseInt(match[0]);
  }
  return -1;
}

function StoreGenerator<T extends SWBaseAPIRecord>(apiBase:string)
{
  // cast this to any to avoid a typing nightmare
  // todo: determine if it's worth the time to learn the intricate typing
  let store = create<T>() as unknown as any;
  
  return store(
    (
      set: (partial: SWStore<T> | Partial<SWStore<T>> | ((state: SWStore<T>) => SWStore<T> | Partial<SWStore<T>>), replace?: boolean | undefined) => void,
      get: () => SWStore<T>
    ) => 
    (
      {
        previouslyRequestedPages: [],
        previouslySearchedStrings: [],
        cache: [],
        maxCount:0,
        add: (item:T, id:number) => set((state) => {
          // create a deep clone of the state to maintain purity
          let mutableState = JSON.parse(JSON.stringify(state)) as SWStore<T>;
          mutableState.cache[id] = item;
          return mutableState;
        }),
        addMultiple: (items:T[]) => set((state) => {
          // create a deep clone of the state to maintain purity
          let mutableState = JSON.parse(JSON.stringify(state)) as SWStore<T>;
          for (let x = 0; x < items.length; x++) {
            let id = ExtractID(items[x].url);
            mutableState.cache[id] = items[x];
          }
          return mutableState;
        }),
        remove: (id:number) => set((state) => {
          // create a deep clone of the state to maintain purity
          let mutableState = JSON.parse(JSON.stringify(state)) as SWStore<T>;
          mutableState.cache[id] = null;
          return mutableState;
        }),
        get: async (id:number, force:boolean) => {
          let store = get();

          //we will first check if this entry already exists in the store.
          //if it does not, we will search for it

          console.log(`${id} requested`);

          if (!store.cache[id] || force) {
            try {
              let response = await axios.get(`${apiBase}/${id}`);

              console.log("Response:",response);

              if (response.data.detail && response.data.detail.toLowerCase() == "Not Found") {
                throw `No record with id ${id} was found!`;
              }

              if (response.data) {
                let item = response.data as T;

                store.add(item,id);
              }
            } catch (error) {
              throw error;
            }
          }
        },
        getPage: async (pageNumber:number, force:boolean) => {
          // our api returns 10 records per page
          // thus, if our array already have members ((pageNumber-1)*10 through pageNumber*10 - 1)
          // we don't need to do another api request

          let store = get();

          if (!force) 
          {
            let canUseLocalCopy = store.previouslyRequestedPages.indexOf(pageNumber) != -1;
            if (canUseLocalCopy) {
              // the store does not need to update
              return;
            }
          }

          try {
            let response = await axios.get(`${apiBase}?page=${pageNumber}`);
            console.log("Page result:",response);
            set((state) => {
              let mutableState = JSON.parse(JSON.stringify(state));
              mutableState.previouslyRequestedPages.push(pageNumber);
              return mutableState;
            });

            if (response.data.results.length > 0) {

              if (store.maxCount != response.data.count) 
              {
                set((state) => {
                  let mutableState = JSON.parse(JSON.stringify(state)) as SWStore<T>;
                  mutableState.maxCount = response.data.count;
                  if (!mutableState.cache[mutableState.maxCount-1]) {
                    mutableState.cache[mutableState.maxCount-1] = null;
                  }
                  return mutableState;
                });
              }

              let items = response.data.results as T[];

              store.addMultiple(items);
            }
          } catch (error) {
            throw error;
          }
        },
        searchFor: async (search:string) => {
          // we don't need to waste any resources if the string is null, undefined, or empty
          if (!search) { return; }
          let store = get();

          if (store.maxCount > 0) {
            let nonNullRecordCount = store.cache.filter(r => !!r).length;

            if (nonNullRecordCount >= store.maxCount - 1) {
              // we don't need to run a search because our data set is already full
              return;
            }
          }

          if (store.previouslySearchedStrings.indexOf(search) != -1) {
            // we have already run this query. We don't need to run it again.
            // Refreshing the page will allow it to be run again.
            return;
          }
          try {
            let result:T[] = [];
            let response = await axios.get(`${apiBase}/?search=${search}`);

            (response.data.results as T[]).forEach(r => result.push(r));
            while (response && response.data && response.data.next) 
            {
              response = await axios.get(response.data.next);
              (response.data.results as T[]).forEach(r => result.push(r));
            }
            
            store.addMultiple(result);

          } catch (error) {
            throw error;
          }
        }
      } as SWStore<T>
    )
  ) as any as UseBoundStore<StoreApi<SWStore<T>>>;
}

const usePeopleStore = StoreGenerator<People>(apiBaseEndpoints.people);
const usePlanetStore = StoreGenerator<Planet>(apiBaseEndpoints.planets);
const useStarshipStore = StoreGenerator<Starship>(apiBaseEndpoints.starships);
const useSpeciesStore = StoreGenerator<Species>(apiBaseEndpoints.species);
const useVehiclesStore = StoreGenerator<Vehicle>(apiBaseEndpoints.vehicles);
const useFilmsStore = StoreGenerator<Film>(apiBaseEndpoints.films);


export const useStarWarsStores = () => {
  const peopleStore = usePeopleStore();
  const planetStore = usePlanetStore();
  const starshipStore = useStarshipStore();
  const speciesStore = useSpeciesStore();
  const vehicleStore = useVehiclesStore();
  const filmStore = useFilmsStore();

  return {
    peopleStore, planetStore, starshipStore, speciesStore, vehicleStore, filmStore
  }
}

export function FilterStoreData(
    data:any[], 
    filter:string = "", 
    filterFields:string[] = [],
    deletedIDs:number[] = [], 
    focusedIDs:number[] = [], 
    removeNullUndefinedEmpty:boolean = false,
    mode:"None"|"Delete"|"Restore" = "None"
  ) 
{
  //NOTE: consider using immer.js for better immutability handling
  let dataCopy = JSON.parse(JSON.stringify(data)) as any[];

  //remove empties
  if (removeNullUndefinedEmpty) 
  {
    dataCopy = dataCopy.filter((d) => !(d == null || d == undefined || d == ""));
  }

  if (mode == "Restore") {
    // in restore mode, we want to see only the deleted records so that we can restore them
    for (let x = 0; x < dataCopy.length; x++) {
      let record = dataCopy[x];
      let index = deletedIDs.indexOf(ExtractID(record.url));
      if (index == -1) {
        // this ID is NOT deleted. We do not want to see it in restore mode.
        dataCopy.splice(x,1);
        x--;
        continue;
      }
    }
  } else {
    // the mode is NOT restore, so we want to show all non-deleted records

      //remove deleted
      for (let x = 0; x < dataCopy.length; x++) 
      {
        let record = dataCopy[x];
        let index = deletedIDs.indexOf(ExtractID(record.url));
        if (index == -1) {
          // the record ID is not in the deletedID array
        } else {
          dataCopy.splice(x,1);
          x--;
          continue;
        }
      }

      //remove NOT focused, if we have any focused
      if (focusedIDs.length > 0) {
        for (let x = 0; x < dataCopy.length; x++) {
          let record = dataCopy[x];
          let index = focusedIDs.indexOf(ExtractID(record.url));
          if (index == -1) {
            // the record ID is NOT being focused. Remove from array
            dataCopy.splice(x,1);
            x--;
            continue;
          } else {
            // the record IS is focused. Keep it in the array.
          }
        }
      }
  }


  
  if (filter == undefined || filter == null || filter == "") 
  {
    return dataCopy;
  }

  //filter by string
  for (let x = 0; x < dataCopy.length; x++) 
  {
    let record = dataCopy[x];
    for (let key of filterFields) {
      if (Object.hasOwn(record,key)) {
        let fieldData = record[key];
        if (typeof(fieldData) != "string") {continue;}
        //the data has the field that is filterable
        //we want to remove this record if the field doesn't match the filter
        let index = fieldData.toLowerCase().indexOf(filter.toLowerCase());
        if (index == -1) {
          // filter was not found on this field
          dataCopy.splice(x,1);
          x--;
          continue;
        }
      }
    }
  }

  return dataCopy;
}


export const consumableSorter = (a:any,b:any) => {
  let f0 = parseFloat(a.consumables);
  let f1 = parseFloat(b.consumables);

  let weekMultiplera = a.consumables.indexOf("week") != -1;
  let monthMultipliera = a.consumables.indexOf("month") != -1;
  let yearMultipliera = a.consumables.indexOf("year") != -1;

  let weekMultiplerb = b.consumables.indexOf("week") != -1;
  let monthMultiplierb = b.consumables.indexOf("month") != -1;
  let yearMultiplierb = b.consumables.indexOf("year") != -1;

  if (yearMultipliera) {
    f0 *= 365;
  } else if (monthMultipliera) {
    f0 *= 30;
  } else if (weekMultiplera) {
    f0 *= 7;
  }

  if (yearMultiplierb) {
    f1 *= 365;
  } else if (monthMultiplierb) {
    f1 *= 30;
  } else if (weekMultiplerb) {
    f1 *= 7;
  }

  return f1 > f0 ? -1: 1;
};
export const lifespanSorter = (a:any, b:any) => {
  function QuickType(v:any) {
    if (v.average_lifespan == "indefinite") {
      return 999999;
    }
    if (v.average_lifespan == "unknown") {
      return 0;
    }
    return parseFloat(v.average_lifespan);
  }

  let f0 = QuickType(a);
  let f1 = QuickType(b);

  return f1 > f0 ? -1 : 1;

}

export type ComparableFieldData = {
  propertyName:string;
  label:string;
  sorter?: (a:any,b:any) => number
}

export const storeToComparableFields:Map<StoreType,ComparableFieldData[]> = new Map([
  ["peopleStore",[
      {propertyName:"height", label: "Height"},
      {propertyName:"mass", label: "Mass"}
  ]],
  ["filmStore",[]],
  ["planetStore",[
      {propertyName:"diameter", label: "Diameter"},
      {propertyName:"rotation_period", label: "Rotation Period"},
      {propertyName:"orbital_period", label: "Orbital Period"},
      {propertyName: "gravity", label: "Gravity", sorter: (a:Planet,b:Planet) => { return parseFloat(a.gravity) < parseFloat(b.gravity) ? -1 : 1 }},
      {propertyName:"population", label: "Population"},
      {propertyName:"surface_water", label: "Surface Water"},
  ]],
  ["starshipStore", [
    {propertyName:"cost_in_credits", label: "Cost"},
    {propertyName:"length", label: "Length"},
    {propertyName:"crew", label: "Crew #"},
    {propertyName:"passengers", label: "Passenger #"},
    {propertyName:"max_atmosphering_speed", label: "Speed"},
    {propertyName:"cargo_capacity", label: "Cargo Limit"},
    {propertyName:"consumables", label: "Consumable Duration", sorter: consumableSorter}
  ]],
  ["vehicleStore", [
    {propertyName:"cost_in_credits", label: "Cost"},
    {propertyName:"length", label: "Length"},
    {propertyName:"crew", label: "Crew #"},
    {propertyName:"passengers", label: "Passenger #"},
    {propertyName:"max_atmosphering_speed", label: "Speed"},
    {propertyName:"cargo_capacity", label: "Cargo Limit"},
    {propertyName:"consumables", label: "Consumable Duration", consumableSorter}
  ]],
  ["speciesStore",[
    {propertyName:"average_height", label: "Height (average)"},
    {propertyName:"average_lifespan", label: "Lifespan (average)", lifespanSorter},
  ]]
])

const peopleColumns:ColumnsType<People> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <span>{text}</span>,
    sorter: (a,b) => a.name < b.name ? -1 : 1,
    width: 120
  },
  {
    title: "Born",
    dataIndex: "birth_year",
    key: "birth_year",
    width: 120
  },
  {
    title: "Height",
    dataIndex: "height",
    key: "height",
    sorter: (a,b) => parseFloat(a.height) < parseFloat(b.height) ? 1 : -1,
    width: 75
  },
  {
    title: "Mass",
    dataIndex: "mass",
    key: "mass",
    sorter: (a,b) => parseFloat(a.mass) < parseFloat(b.mass) ? 1 : -1,
    width: 75
  },
  {
    title: "Hair",
    dataIndex: "hair_color",
    key: "hair_color",
    sorter: (a,b) => (a.hair_color) < (b.hair_color) ? 1 : -1,
    width: 70
  },
  {
    title: "Skin",
    dataIndex: "skin_color",
    key: "skin_color",
    sorter: (a,b) => (a.skin_color) < (b.skin_color) ? 1 : -1,
    width: 80
  },
  {
    title: "Eyes",
    dataIndex: "eye_color",
    key: "eye_color",
    sorter: (a,b) => (a.eye_color) < (b.eye_color) ? 1 : -1,
    width: 80
  },
  {
    title: "Gender",
    dataIndex: "gender",
    key: "gender",
    sorter: (a,b) => (a.gender) < (b.gender) ? 1 : -1,
    width: 75
  }
]
const filmColumns:ColumnsType<Film> = [
  {
    title: "Name",
    dataIndex: "title",
    key: "title",
    render: (text) => <span>{text}</span>,
    sorter: (a,b) => a.title < b.title ? -1 : 1,
    width: 120
  },
  {
    title: "Episode",
    dataIndex: "episode_id",
    key: "episode_id",
    sorter: (a,b) => a.episode_id < b.episode_id ? -1 : 1,
    width: 90
  },
  {
    title: "Opening",
    dataIndex: "opening_crawl",
    key: "opening_crawl",
    render: (text) => <>
      <Popover content={<Card>{text}</Card>} title="Opening Crawl" trigger="click">
        <Button style={{position: "relative", left: "-15px"}} onClick={(e) => e.stopPropagation() } type="link">Details</Button>
      </Popover>
    </>,
    width: 90
  },
  {
    title: "Director",
    dataIndex: "director",
    key: "director",
    sorter: (a,b) => a.director < b.director ? -1 : 1,
    width: 120
  },
  {
    title: "Producer",
    dataIndex: "producer",
    key: "producer",
    sorter: (a,b) => a.producer < b.producer ? -1 : 1,
    width: 120
  },
  {
    title: "Released",
    dataIndex: "release_data",
    key: "release_data",
    width: 120,
    render: (text, record) => {
      
      return <>
        <label>{record.release_date}</label>
      </>
    },
    sorter: (a,b) => {
      let d0 = new Date(a.release_date);
      let d1 = new Date(a.release_date);

      return d0 < d1 ? -1 : 1;
    }
  }
]
const planetColumns:ColumnsType<Planet> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <span>{text}</span>,
    sorter: (a,b) => a.name < b.name ? -1 : 1,
    width: 120,
  },
  {
    title: "Diameter",
    dataIndex: "diameter",
    key: "diameter",
    sorter: (a,b) => parseFloat(a.diameter) < parseFloat(b.diameter) ? -1 : 1,
    width: 90
  },
  {
    title: "Rotation Period",
    dataIndex: "rotation_period",
    key: "rotation_period",
    sorter: (a,b) => parseFloat(a.rotation_period) < parseFloat(b.rotation_period) ? -1 : 1,
    width: 120
  },
  {
    title: "Orbital Period",
    dataIndex: "orbital_period",
    key: "orbital_period ",
    sorter: (a,b) => parseFloat(a.orbital_period )< parseFloat(b.orbital_period) ? -1 : 1,
    width: 120
  },
  {
    title: "Gravity",
    dataIndex: "gravity",
    key: "gravity",
    sorter: (a,b) => parseFloat(a.gravity) < parseFloat(b.gravity) ? -1 : 1,
    width: 90
  },
  {
    title: "Population",
    dataIndex: "population",
    key: "population",
    sorter: (a,b) => parseFloat(a.population) < parseFloat(b.population) ? -1 : 1,
    width: 120
  },
  {
    title: "Surface Water",
    dataIndex: "surface_water",
    key: "surface_water",
    sorter: (a,b) => parseFloat(a.surface_water) < parseFloat(b.surface_water) ? -1 : 1,
    width: 90
  },
  {
    title: "Climate",
    dataIndex: "climate",
    key: "climate",
    sorter: (a,b) => a.climate < b.climate ? -1 : 1,
    width: 120
  },
  {
    title: "Terrain",
    dataIndex: "terrain",
    key: "terrain",
    sorter: (a,b) => a.terrain < b.terrain ? -1 : 1,
    width: 120
  }

]
const speciesColumns:ColumnsType<Species> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a,b) => a.name < b.name ? -1 : 1,
    width: 120
  },
  {
    title: "Class",
    dataIndex: "classification",
    key: "classification",
    width: 120
  },
  {
    title: "Designation",
    dataIndex: "designation",
    key: "designation",
    width: 120
  },
  {
    title: "Height (average)",
    dataIndex: "average_height",
    key: "average_height",
    width: 120
  },
  {
    title: "Lifespan (average)",
    dataIndex: "average_lifespan",
    key: "average_lifespan",
    sorter: lifespanSorter,
    width: 120
  },
  {
    title: "Eye Colors",
    width: 75,
    dataIndex: "eye_colors",
    key: "eye_colors",
    render: (text,record,index) => {
      return <>
        <Popover content={
          <div>
            {
              record.eye_colors.split(",").map((c,i) => <div key={i}>{c}</div>)
            }
          </div>
        } title={`${record.name} eye colors`} 
          trigger="click"
        >
          <Button style={{position: "relative", left: "-20px"}} onClick={(e) => e.stopPropagation() } type="link">Details</Button>
        </Popover>
        
      </>
    }
  },
  {
    title: "Hair Colors",
    width: 75,
    dataIndex: "hair_colors",
    key: "hair_colors",
    render: (text,record,index) => {
      return <>
        <Popover content={
          <div>
            {
              record.hair_colors.split(",").map((c,i) => <div key={i}>{c}</div>)
            }
          </div>
        } title={`${record.name} hair colors`} 
          trigger="click"
        >
          <Button style={{position: "relative", left: "-20px"}} onClick={(e) => e.stopPropagation() } type="link">Details</Button>
        </Popover>
        
      </>
    }
  },
  {
    title: "Skin Colors",
    width: 75,
    dataIndex: "skin_colors",
    key: "skin_colors",
    render: (text,record,index) => {
      return <div>
        <Popover content={
          <div>
            {
              record.skin_colors.split(",").map((c,i) => <div key={i}>{c}</div>)
            }
          </div>
        } title={`${record.name} skin colors`} 
          trigger="click"
        >
          <Button style={{position: "relative", left: "-20px"}} onClick={(e) => e.stopPropagation() } type="link">Details</Button>
        </Popover>
        
      </div>
    }
  },
  {
    title: "Language",
    dataIndex: "language",
    key: "language",
    width: 120
  }
]
const starshipColumns:ColumnsType<Starship> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a,b) => a.name < b.name ? -1 : 1,
    width: 120
  },
  {
    title: "Model",
    dataIndex: "model",
    key: "model",
    sorter: (a,b) => a.name < b.name ? -1 : 1,
    width: 120
  },
  {
    title: "Class",
    dataIndex: "starship_class",
    key: "starship_class",
    sorter: (a,b) => a.name < b.name ? -1 : 1,
    width: 120
  },
  {
    title: "Manufacturer",
    dataIndex:"manufacturer",
    key:"manufacturer",
    sorter: (a,b) => a.name < b.name ? -1 : 1,
    width: 120
  },
  {
    title: "Cost",
    dataIndex:"cost_in_credits",
    key: "cost_in_credits",
    sorter: (a,b) => parseFloat(a.cost_in_credits) < parseFloat(b.cost_in_credits) ? -1 : 1,
    width: 80
  },
  {
    title: "Length",
    dataIndex: "length",
    key: "length",
    sorter: (a,b) => parseFloat(a.length) < parseFloat(b.length) ? -1 : 1,
    width: 80
  },
  {
    title: "Crew",
    dataIndex: "crew",
    key: "crew",
    sorter: (a,b) => parseFloat(a.crew) < parseFloat(b.crew) ? -1 : 1,
    width: 80
  },
  {
    title: "Passengers",
    dataIndex: "passengers",
    key: "passengers",
    sorter: (a,b) => parseFloat(a.passengers) < parseFloat(b.passengers) ? -1 : 1,
    width: 80
  },
  {
    title: "Atmosphering Speed",
    dataIndex: "max_atmosphering_speed",
    key: "max_atmosphering_speed",
    sorter: (a,b) => parseFloat(a.max_atmosphering_speed) < parseFloat(b.max_atmosphering_speed) ? -1 : 1,
    width: 95
  },
  {
    title: "Hyperdrive Rating",
    dataIndex: "hyperdrive_rating",
    key: "hyperdrive_rating",
    sorter: (a,b) => a.hyperdrive_rating < b.hyperdrive_rating ? -1 : 1,
    width: 80
  },
  {
    title: "MGLT",
    dataIndex: "MGLT",
    key: "MGLT",
    sorter: (a,b) => parseFloat(a.MGLT) < parseFloat(b.MGLT) ? -1 : 1,
    width: 80
  },
  {
    title: "Cargo Capacity",
    dataIndex: "cargo_capacity",
    key: "cargo_capacity",
    sorter: (a,b) => parseFloat(a.cargo_capacity) < parseFloat(b.cargo_capacity) ? -1 : 1,
    width: 85
  },
  {
    title: "Consumable Duration",
    dataIndex: "consumables",
    key: "consumables",
    sorter: consumableSorter,
    width: 90
  }

]
const vehicleColumns:ColumnsType<Vehicle> = [
  {
    title: "Name",
    dataIndex: "name",
    key:"name",
    sorter: (a,b) => (a.name) < (b.name) ? -1 : 1,
    width: 120
  },
  {
    title:"Model",
    dataIndex:"model",
    key:"model",
    sorter: (a,b) => (a.model) < (b.model) ? -1 : 1,
    width: 120
  },
  {
    title:"Class",
    dataIndex:"vehicle_class",
    key:"vehicle_class",
    sorter: (a,b) => (a.vehicle_class) < (b.vehicle_class) ? -1 : 1,
    width: 120
  },
  {
    title: "Manufacturer",
    dataIndex:"manufacturer",
    key:"manufacturer",
    sorter: (a,b) => a.manufacturer < b.manufacturer ? -1 : 1,
    width: 120
  },
  {
    title: "Cost",
    dataIndex:"cost_in_credits",
    key: "cost_in_credits",
    sorter: (a,b) => parseFloat(a.cost_in_credits) < parseFloat(b.cost_in_credits) ? -1 : 1,
    width: 120
  },
  {
    title: "Length",
    dataIndex: "length",
    key: "length",
    sorter: (a,b) => parseFloat(a.length) < parseFloat(b.length) ? -1 : 1,
    width: 120
  },
  {
    title: "Crew",
    dataIndex: "crew",
    key: "crew",
    sorter: (a,b) => parseFloat(a.crew) < parseFloat(b.crew) ? -1 : 1,
    width: 120
  },
  {
    title: "Passengers",
    dataIndex: "passengers",
    key: "passengers",
    sorter: (a,b) => parseFloat(a.passengers) < parseFloat(b.passengers) ? -1 : 1,
    width: 120
  },
  {
    title: "Atmosphering Speed",
    dataIndex: "max_atmosphering_speed",
    key: "max_atmosphering_speed",
    sorter: (a,b) => parseFloat(a.max_atmosphering_speed) < parseFloat(b.max_atmosphering_speed) ? -1 : 1,
    width: 125
  },
  {
    title: "Cargo Capacity",
    dataIndex: "cargo_capacity",
    key: "cargo_capacity",
    sorter: (a,b) => parseFloat(a.cargo_capacity) < parseFloat(b.cargo_capacity) ? -1 : 1,
    width: 120
  },
  {
    title: "Consumable Duration",
    dataIndex: "consumables",
    key: "consumables",
    sorter: consumableSorter,
    width: 120
  }
  
]
export const GetColumnsImmutable = (category:StoreType) =>
{
  let immutableColumns = peopleColumns as any;
  switch (category) {
    case "peopleStore":
      immutableColumns = peopleColumns;
      break;
    case "filmStore":
      immutableColumns = filmColumns;
      break;
    case "planetStore":
      immutableColumns = planetColumns;
      break;
    case "speciesStore":
      immutableColumns = speciesColumns;
      break;
    case "starshipStore":
      immutableColumns = starshipColumns;
      break;
    case "vehicleStore":
      immutableColumns = vehicleColumns;
      break;
  }

  let clone:any = [];
  for (let x = 0; x < immutableColumns.length; x++) {
    let colData = immutableColumns[x] as any[];
    clone.push({...colData});
  }

  return clone;
}