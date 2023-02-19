import { create } from "zustand";
import { StoreType } from "../APIs/starwars";

type RecordTrackerType = 
{
  peopleStore:number[];
  planetStore:number[];
  vehicleStore:number[];
  speciesStore:number[];
  filmStore:number[];
  starshipStore:number[];
  AddTracker: (target:StoreType, id:number) => void;
  RemoveTracker: (target:StoreType, id:number) => void;
  Clear: (target:StoreType) => void;
  ClearAll: () => void;
};

export default function RecordTrackerFactory() 
{
  return create<RecordTrackerType>()(
    (set,get) => ({
      filmStore: [],
      peopleStore: [],
      planetStore: [],
      speciesStore: [],
      starshipStore: [],
      vehicleStore: [],
      AddTracker:(target:StoreType, id:number) => {
        let mutableState = JSON.parse(JSON.stringify(get()));
        let mutableArray = (mutableState as any)[target] as Array<number>;
  
        if (mutableArray.indexOf(id) != -1) {
          // we're already tracking this deleted id
          return;
        }
        mutableArray.push(id);
  
        (mutableState as any)[target] = mutableArray;
  
        set(mutableState);
      },
      RemoveTracker:(target:StoreType, id:number) => {
        let mutableState = JSON.parse(JSON.stringify(get()));
        let mutableArray = (mutableState as any)[target] as Array<number>;
  
        let index = mutableArray.indexOf(id);
        if (index != -1) {
          mutableArray.splice(index,1);
        } else {
          // we're already NOT tracking this deleted id
          return;
        }
  
        (mutableState as any)[target] = mutableArray;
  
        set(mutableState);
      },
      Clear:(target:StoreType) => {
        let mutableState = JSON.parse(JSON.stringify(get()));
  
        (mutableState as any)[target] = [];
  
        set(mutableState);
      },
      ClearAll:() => {
        let mutableState = JSON.parse(JSON.stringify(get())) as RecordTrackerType;
  
        mutableState.filmStore = [];
        mutableState.vehicleStore = [];
        mutableState.speciesStore = [];
        mutableState.starshipStore = [];
        mutableState.peopleStore = [];
        mutableState.planetStore = [];
  
        set(mutableState);
      }
    })
  );
}