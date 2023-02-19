import { Card, Checkbox, message, Popover, Select, Space, Table, Tag, Tooltip } from "antd";
import { ColumnGroupType, ColumnsType, ColumnType } from "antd/es/table";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {ExtractID, People,  StoreType,  SWBaseAPIRecord,  SWStore,  useStarWarsStores, FilterStoreData, GetColumnsImmutable} from "../APIs/starwars";
import styled from "styled-components";
import SpinFC from "antd/es/spin";
import Input from "antd/es/input";
import { CloseCircleOutlined, DeleteOutlined, PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import Button from "antd/es/button";
import { DefaultOptionType } from "antd/es/select";
import useDeletedRecordTracker from "../Hooks/DeletedRecordTracker";
import useFocusedRecorderTracker from "../Hooks/FocusRecordTracker";
import useMessage from "antd/es/message/useMessage";

const storeToSearchableFields:Map<StoreType,string[]> = new Map([
  ["peopleStore",["name"]],
  ["filmStore",["title"]],
  ["starshipStore",["name","model"]],
  ["vehicleStore",["name", "model"]],
  ["speciesStore",["name"]],
  ["planetStore",["name"]],
])


const ContainerStyle = styled.div`
  .App {
    position: relative;
    margin: 12px;
    padding: 2px 6px;
    border: 1px solid rgba(170,170,170,0.2);
    transition: all 0.1s linear;


    box-shadow: 0px 0px 4px 4px rgba(170,170,170,0.05) inset, 0px 0px 4px 4px rgba(170,170,170,0);

    th.checkbox, td.checkbox {
        display: none;
    }
    &[data-action-mode]:not([data-action-mode="Normal"]) {
      th.checkbox, td.checkbox {
        display: table-cell;
      }
    }
    /* &[data-action-mode="Normal"] {
      th.checkbox, td.checkbox {
        width: 30px;
      }
    } */

    &[data-action-mode]:not([data-action-mode="Normal"]) {
      tr {
      transition: all 0.1s linear;
      box-shadow: 0px 0px 10px 10px rgba(100,100,255,0.0) inset !important;
      cursor: pointer;
      & .ant-table-column-sort {
        background-color: transparent;
      }
      }
      tr.selected {
        box-shadow: 0px 0px 10px 10px rgba(20,20,100,0.1) inset !important;
        & td.ant-table-cell-row-hover {
          background-color: rgba(0,0,0,0.1) !important;
        }
        & td.ant-table-cell-fix-left {
          background-color: rgba(255,255,255,1) !important;
          box-shadow: 0px 0px 10px 10px rgba(20,20,100,0.1) inset !important;
        }
      }
      tr.active {
        box-shadow: 0px 0px 10px 10px rgba(100,100,255,0.075) inset !important;
        & td.ant-table-cell-row-hover {
          background-color: rgba(0,0,0,0.05) !important;
        }
        & td.ant-table-cell-fix-left {
        box-shadow: 0px 0px 10px 10px rgba(100,100,255,0.075) inset !important;
        }
      }
      th.trash-column, td.trash-column {
        display: none;
      }
      & * {
        user-select: none;
      }
    }
    &[data-action-mode="Delete"] {
      border: 1px solid rgba(255,170,170,0.3);
      box-shadow: 0px 0px 4px 4px rgba(255,170,170,0.2) inset, 0px 0px 4px 4px rgba(255,170,170,0.2);

    }
    &[data-action-mode="Restore"] {
      border: 1px solid rgba(36, 170, 36, 0.3);
      box-shadow: 0px 0px 4px 4px rgba(36, 170, 36,0.2) inset, 0px 0px 4px 4px rgba(36, 170, 36,0.2);
    }
  }
  .headerContainer {
    display: grid;
    grid-template-columns: 0.4fr 1.0fr 0.2fr;
    align-items: center;
    padding: 10px 2px;
  }
  .focusMessageContainer {
    
  }
  .searchInput {
  }
  .actionButtons {
    display: flex;
    flex-direction: row;
    justify-items: right;
    & .deleteButton {
      color: rgba(220,20,20,1.0);
      border-color: red;
      transition: all 0.1s linear;
      box-shadow: 0px 0px 10px 5px rgba(255,0,0,0.0) inset;
      margin-left: 10px;

      &:hover {
        color: rgba(240,20,20,1.0);
      }
      &:active {
        color: rgba(255,0,0,1.0);
        box-shadow: 0px 0px 2px 2px rgba(255,0,0,0.2) inset;
      }
      &[disabled] {
        pointer-events: none;
        opacity: 0.5;
      }
    }
    & .restoreButton {
      margin-right: 10px;
      color: rgba(10,120,10,1.0);
      border-color: green;
      transition: all 0.1s linear;
        box-shadow: 0px 0px 10px 5px rgba(255,0,0,0.0) inset;

      &:hover {
        color: rgba(20,130,20,1.0);
      }
      &:active {
        color: rgba(0,150,0,1.0);
        box-shadow: 0px 0px 2px 2px rgba(0,255,0,0.2) inset;
      }
      &[disabled] {
        pointer-events: none;
        opacity: 0.5;
      }
    }
  }
  .icon {
    cursor: pointer;
    position: relative;
    top: 3px;
    font-size: 1.4rem;
    transition: all 0.1s linear;
    box-shadow: 0px 0px 5px 5px rgba(0,0,0,0) inset;
    border-radius: 50%;
    &:hover {
      top: 5px;
      font-size: 1.5rem;
      box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.25) inset;
    }
    &:active {
      transition: all 0.05s linear;
      box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.45) inset;
    }

    &.cancel {
      top: 0px;
    }

    &.trash {
      color: rgba(170,30,30,1);
      border-radius:2px;
      padding: 3px;
      top: 0px;
      left: 3px;
      &:hover {
        box-shadow: 0px 0px 5px 5px rgba(60,0,0,0.05) inset;
      }
      &:active {
        transition: all 0.05s linear;
        box-shadow: 0px 0px 5px 5px rgba(60,0,0,0.1) inset;
        color: rgba(190,50,50,1);
      }
    }
  }
  
  @media screen and (max-width: 768px)
  {
    .App {
      max-width: 400px;
    }
  }
`;


const TableFooter = styled.div`
  display: flex;
  flex-basis: 1;
  justify-content: space-between;
`;

export const ArrayWithoutNulls = (arr:any[]) => {
  return arr.filter(r => !!r);
}

type SortedFieldType = {
  field:string;
  direction:"ascend"|"descend";
}
// the user can view data normally, search for data, or "Drill Down" a category
// which will show the data on another table related to the drilled down record
type FocusMode = "Normal"|"Drilldown"|"Search"|"SearchAndDrilldown";
// the user can specifically view all data, the deleted data only, or the focused data only
type ViewMode = "Normal"|"Deleted";
// the user can either be viewing normally or selecting records
type ActionMode = "Normal"|"Delete"|"Restore"
type DrilldownDetail = {
  drilledCategory:StoreType;
  originalCategory:StoreType;
  requestingRecord:SWBaseAPIRecord;
}
type Props = {
  category: StoreType;
  changeCategory: (value:StoreType) => void;
}
function StarwarsTable({category, changeCategory}:Props) {
  const starwarsStore = useStarWarsStores();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  // const [numberOfLoadedPages, setNumberOfLoadedPages] = useState(0);
  // const [totalPages, setTotalPages] = useState(1);
  const [selectedLocalPage, setSelectedLocalPage] = useState(1);
  const [columns, setColumns] = useState<ColumnsType<SWBaseAPIRecord>>([]);
  const [pageSize, setPageSize] = useState(5);
  //const [filteredCache, setFilteredCache] = useState(ArrayWithoutNulls(starwarsStore[category].cache) as SWBaseAPIRecord[]);
  //const filteredCacheReference = useRef<SWBaseAPIRecord[]>([]);
  const selectedRecordReference = useRef<number[]>([]);
  const filteredCacheReference = useRef<SWBaseAPIRecord[]>([]);
  const [tableKey, setTableKey] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const deletedRecordStore = useDeletedRecordTracker();
  const focusedRecordStore = useFocusedRecorderTracker();
  const [filteredCache, setFilteredCache] = useState(FilterStoreData(
    starwarsStore[category].cache,
    filter,
    storeToSearchableFields.get(category),
    deletedRecordStore[category],
    focusedRecordStore[category], 
    true) as SWBaseAPIRecord[]
  );
  const drilldownRequest = useRef<DrilldownDetail|null>(null);
  const tableRef = useRef<HTMLDivElement>(null as any);
  const horizontalScroll = useRef(0);
  const [viewMode, setViewMode] = useState<ViewMode>("Normal");
  const [actionMode, setActionMode] = useState<ActionMode>("Normal");
  const sortedField = useRef<SortedFieldType>({field: "", direction: "ascend"});
  const lastClickedColData = useRef<ColumnGroupType<any> | ColumnType<any> | undefined>(undefined);

  const peopleColumns = GetColumnsImmutable("peopleStore");
  const filmColumns = GetColumnsImmutable("filmStore");
  const planetColumns = GetColumnsImmutable("planetStore");
  const speciesColumns = GetColumnsImmutable("speciesStore");
  const starshipColumns = GetColumnsImmutable("starshipStore");
  const vehicleColumns = GetColumnsImmutable("vehicleStore");


  function GetColumns(category:StoreType) 
  {
    switch (category) {
      case "peopleStore":
        return peopleColumns;
        break;
      case "filmStore":
        return filmColumns;
        break;
      case "planetStore":
        return planetColumns;
        break;
      case "speciesStore":
        return speciesColumns;
        break;
      case "starshipStore":
        return starshipColumns;
        break;
      case "vehicleStore":
        return vehicleColumns;
        break;
    }
  }

  // add events to every single column to preserve state across selection clicks
  function ConstructColumnListeners() 
  {
    let everyColumn = [...peopleColumns,...filmColumns,...planetColumns,...speciesColumns,...starshipColumns,...vehicleColumns] as ColumnsType<any>;

    for (let x = 0; x < everyColumn.length; x++) {
      let colData = everyColumn[x];


      if (colData.key && sortedField.current.field == colData.key) {
        colData.sortOrder = sortedField.current.direction;
      } else {
        colData.sortOrder = "" as any;
      }

      colData.onHeaderCell = (data, index) => {
        return {
          onClick: (e) => {
            console.log("Clicked:", data);

            if (lastClickedColData.current != undefined && lastClickedColData.current != colData) {
              lastClickedColData.current.sortOrder = "" as any;
            }

            sortedField.current.field = data.key?.toString() ?? "";
            let dir = colData.sortOrder;
            if (!dir) {
              dir = "ascend";
            } else if (dir == "ascend") {
              dir = "descend";
            } else {
              dir = "" as any;
              sortedField.current.field = "";
            }
            colData.sortOrder = dir;
            sortedField.current.direction = dir as any;
            lastClickedColData.current = colData;
            setTableKey((state) => (state + 1) % 20);
          }
        }
      }
      
    }
  }
  ConstructColumnListeners();


  // this is for the checkbox so the user can select
  // one or multiple records for "extra actions"
  const sharedColumnsFront:ColumnsType<SWBaseAPIRecord> = [
    {
      title: (data) => 
      {
        let allChecked = filteredCacheReference.current.length > 0 && selectedRecordReference.current.length == filteredCacheReference.current.length;
        
        return (
          <Checkbox
            onClick={() => {
              let mutableSelectedRecords:number[] = [];
              if (allChecked) {
                // don't need to do anything else. All records will be unselected
              } else {
                // need to select all items
                filteredCacheReference.current.forEach(r => mutableSelectedRecords.push(ExtractID(r.url)))
              }
              setTableKey((state) => (state + 1) % 20);
              selectedRecordReference.current = (mutableSelectedRecords);
            }}
            checked={allChecked}
          />
        )
      },
      key: "select",
      //fixed: "left",
      render: (text, record) => {
        let checked = selectedRecordReference.current.indexOf(ExtractID(record.url)) != -1;
        return <Checkbox checked={checked}/>
      },
      onCell: (record, rowIndex) => {
        return {
          onClick: (e) => {
            e.stopPropagation();
            let mutableSelectedRecords:number[] = [...selectedRecordReference.current];
            let id = ExtractID(record.url);
            let index = mutableSelectedRecords.indexOf(id);
            if (index != -1) {
              mutableSelectedRecords.splice(index,1);
            } else {
              mutableSelectedRecords.push(id);
            }
            console.log(id, selectedRecordReference.current);

            setTableKey((state) => (state + 1) % 20);
            selectedRecordReference.current =(mutableSelectedRecords);
          }
        }
      },
      onHeaderCell: (data) => 
      {
        
        return {
          onClick: () => {
            console.log(data);
          }
        }
      },
      className: "checkbox"
      
    },
    {
      title: "Delete",
      key: "delete",
      //fixed: "left",
      width: 200,
      className: "trash-column",
      render: (val, record, index) => {

        const handleClick = () => {
          const id = ExtractID(record.url);
          deletedRecordStore.AddTracker(category,id);

          console.log("Adding deleted: ", category, id);
        }

        return (
          <DeleteOutlined onClick={handleClick} className='trash icon'/>
        )
      }
    }
  ];
  const sharedColumnsBack:ColumnsType<any> = [
    {
      title: "Extras",
      key: "extras",
      render: (value, record, index) => {
        let allPossibleOptions = [
          "Films","Species","Vehicles","Starships", "Homeworld", "People","Characters","Residents","Pilots",
        ]
        let corrospondingCategories:StoreType[] = [
          "filmStore","speciesStore","vehicleStore","starshipStore", "planetStore", "peopleStore","peopleStore","peopleStore","peopleStore",
        ]

        let processedOptions:DefaultOptionType[] = [];
        allPossibleOptions.forEach((option, index) => {
          if (Object.hasOwn(record,option.toLowerCase())) {
            let val = record[option.toLowerCase()] as Array<any>;
            if (val == undefined || val == null) {
              return;
            }
            if (val.length > 0){
              processedOptions.push({
                label: option,
                value: corrospondingCategories[index]
              })
            }

          }
        })

        return (
          <Select 
            value={"Jump To..."}
            options={processedOptions}
            onClick={
              (e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }
            }
            onSelect={
              (val,option) => {
                
                let propertyName = option.label?.toString().toLowerCase() ?? "";
                // val is the storeType we're moving to
                // option.label.toLowerCase() is the property

                let propertyValue = record[propertyName] as Array<string>;

                let ids:number[] = [];

                if (propertyName == "homeworld") 
                {
                  // the property will be a string for homeworld and an array for all other options
                  ids = [(ExtractID(propertyValue as any))];
                } else {
                  ids = propertyValue.map(v => ExtractID(v));
                }

                if (ids.length == 0) 
                {
                  // do a popup notification that we can't drill down here
                  // this is an error because the option shouldn't exist in the first place
                  console.error("Selection option should not be available!", option);
                  return;
                }

                focusedRecordStore.ClearAll();
                let promises:Promise<any>[] = [];
                setLoading(true);
                ids.forEach(i => {
                  focusedRecordStore.AddTracker(val as StoreType,i);
                  let promise = starwarsStore[val as StoreType].get(i,false);
                  promises.push(promise);

                  promise.catch((e) => {
                    console.error(e);
                  });
                });

                Promise.allSettled(promises).then(() => {
                  setLoading(false);
                });

                drilldownRequest.current = {
                  drilledCategory: val as StoreType,
                  originalCategory: category,
                  requestingRecord: record
                }
                setActionMode("Normal");

                changeCategory(val as any);
              }
            }
          />
        )
      }
    }
  ];

  function GetNumberOfLoadedPages() {
    return starwarsStore[category].previouslyRequestedPages.length;
  }
  function GetCurrentTotalPages() {
    let count = starwarsStore[category].maxCount;
    if (count == 0) {return 1;}
    return Math.ceil(count / 10);
  }

  function GetFocusStatus():FocusMode 
  {
    let focus:FocusMode = "Normal";

    if (focusedRecordStore[category].length > 0) 
    {
      //the user specifically requested certain resources
      // this is different than searching
      if (filter) {
        focus = "SearchAndDrilldown";
      } else {
        focus = "Drilldown";
      }
    } else if (filter) {
      //a search is being done 
      focus = "Search";
    }

    return focus;
  }
  function GetFocusElement():React.ReactNode
  {
    let focusType = GetFocusStatus();
    let message = <></>;
    
    let prettyCategory = category.substring(0,category.indexOf("Store"));
    let name = "";
    if (drilldownRequest.current) 
    {
      if (Object.hasOwn(drilldownRequest.current.requestingRecord,"name")) {
        name = (drilldownRequest.current.requestingRecord as any)["name"];
      }else if (Object.hasOwn(drilldownRequest.current.requestingRecord,"title")) {
        name = (drilldownRequest.current.requestingRecord as any)["title"];
      }
    }
    
    function HandleClose() {
      focusedRecordStore.ClearAll();
    }

    switch (focusType) 
    {
      case "Normal":
        message = 
          <div style={{opacity: 0.4}}>
            {`Viewing ${prettyCategory.toUpperCase()}`}
          </div>;
        break;
      case "Drilldown":
        message = 
        <div>
          <Tag closable onClose={HandleClose} color="geekblue">
            {`Viewing Results For ${name} in ${prettyCategory.toUpperCase()}`}
          </Tag>
        </div>;
        break;
      case "Search":
        message = 
        <div style={{opacity:  0.4}}>
          {`Viewing Search Results`}
        </div>;
        break;
      case "SearchAndDrilldown":
        message = 
        <div>
          <div style={{opacity:  0.4}}>
            {`Viewing Search Results`}
          </div>
          <div>
            <Tag closable onClose={HandleClose} color="geekblue">
              {`Viewing Results For ${name} in ${prettyCategory.toUpperCase()}`}
            </Tag>
          </div>
        </div>;
        break;
    }

    return <>
      {message}
    </>
  }

  // keep a reference to the filteredCache for the selection tools
  useEffect(() => {
    filteredCacheReference.current = filteredCache;
  },[filteredCache]);


  // clean up the selectedRecords array when deletedRecordStore is updated
  // if an ID is deleted, it shouldn't be selected
  useEffect(() => {
    let mutableSelectedRecords = [...selectedRecordReference.current];
    let oneWasHit = false;
    deletedRecordStore[category].forEach(id => {
      let index = mutableSelectedRecords.indexOf(id);
      if (index != -1) {
        mutableSelectedRecords.splice(index,1);
        oneWasHit = true;
      }
    });
    if (oneWasHit) {
      selectedRecordReference.current = (mutableSelectedRecords);
    }
  },[deletedRecordStore])

  useEffect(() => {
    let filteredData = 
      FilterStoreData(
        starwarsStore[category].cache,
        filter,
        storeToSearchableFields.get(category),
        deletedRecordStore[category],
        focusedRecordStore[category],
        true,
        actionMode
      );

    setFilteredCache(filteredData as SWBaseAPIRecord[]);
  },[deletedRecordStore, focusedRecordStore, category, starwarsStore[category].cache, filter, actionMode])

  // this is the core "reset" effect
  // for when the chosen category changes
  useEffect(() => {

    setFilter("");
    setLoading(true);
    setSelectedLocalPage(1);
    setColumns([...sharedColumnsFront, ...GetColumns(category), ...sharedColumnsBack]);

    selectedRecordReference.current =([]);

    starwarsStore[category].getPage(1, false).then(() => {
      setLoading(false);
    });
  },[category])

  // any time we update the filter we want to run a search from the server
  // to check for records we don't hold locally
  useEffect(() => {
    DoSearch(starwarsStore[category] as SWStore<any>, filter);
  },[filter])


  //update a lot.
  // we keep the reference to the scroll container fresh here
  useEffect(() => {
    //focusedRecordStore.AddTracker("peopleStore", 2);
    //console.log("Table ref:", tableRef.current);
    let scrollContainer = tableRef.current.querySelector(".ant-table-content");
    function SaveHorizontalScroll() {
      if (scrollContainer) {
        //console.log("Storing scroll: ", scrollContainer.scrollLeft);
        horizontalScroll.current = (scrollContainer.scrollLeft);
      }
    }
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll",SaveHorizontalScroll);
      scrollContainer.scrollLeft = horizontalScroll.current;
    }
    

    return () => {
      if (scrollContainer) { 
        scrollContainer.removeEventListener("scroll",SaveHorizontalScroll); 
      }
    }
  });


  function LoadNextPage() 
  {
    var numLoaded = GetNumberOfLoadedPages();
    if (numLoaded < GetCurrentTotalPages()) 
    {
      setLoading(true);
      let nextPage = numLoaded + 1;
      starwarsStore[category].getPage(nextPage, false).then(() => {
        
        setLoading(false);
      });
    }
  }

  async function LoadRemainingPages<T extends SWBaseAPIRecord>(store:SWStore<T>) 
  {
    let promises:Promise<any>[] = [];
    for (let x = 1; x <= GetCurrentTotalPages(); x++) {
      let promise = store.getPage(x,false);
      promises.push(promise);
    }
    try {
      setLoading(true);
      await Promise.allSettled(promises);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }
  async function DoSearch<T extends SWBaseAPIRecord>(store:SWStore<T>, search:string) {
    try {
      setLoading(true);
      await store.searchFor(search);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function BlurOnReturn(e:React.KeyboardEvent<HTMLInputElement>) {
    if (e.key.toLowerCase() == "enter") {
      e.currentTarget.blur();
    }
  }
  function SetFilterOnBlur(e:React.FocusEvent<HTMLInputElement, Element>) {
    if (e.relatedTarget?.classList.contains("cancel")) {
      return;
    }
    setFilter(searchValue);
  }

  function IsOnLastPage() {
    let result = (GetNumberOfLoadedPages() < GetCurrentTotalPages() && selectedLocalPage == (Math.ceil(filteredCache.length / pageSize)));

    return result;
  }

  function DisplayBarGraph() {

  }

  function BuildFooter():any {

    return (
      <TableFooter>
        <Space>
          <Button
              onClick={() => LoadRemainingPages(starwarsStore[category] as SWStore<any>)}
            >
              Load All Data
          </Button>
          <Button
              onClick={LoadNextPage}
            >
              Load More Data
          </Button>
        </Space>


        <Button
            onClick={DisplayBarGraph}
          >
            Show In Graph
        </Button>
      </TableFooter>
    )
  }

  function BuildSearchAddon(inputValue:string) {
    if (inputValue) {
      return (
        <Tooltip 
            title="Cancel Search"
          >
          <CloseCircleOutlined
            onClick={(e) => {
              e.stopPropagation();
              setFilter("");
              setSearchValue("");
            }}
            className='icon cancel'
          />
        </Tooltip>

      )
    } else {
      return <SearchOutlined />
    }
  }

  function HandleDelete() 
  {
    for (let x = 0; x < selectedRecordReference.current.length; x++) {
      let id = selectedRecordReference.current[x];
      deletedRecordStore.AddTracker(category,id);
      console.log("Adding id: ",id);
    }
  }
  function HandleRestore() 
  {
    for (let x = 0; x < deletedRecordStore[category].length; x++) {
      let id = deletedRecordStore[category][x];
      if (selectedRecordReference.current.indexOf(id) != -1) 
      {
        starwarsStore[category].get(id,false);
        deletedRecordStore.RemoveTracker(category,id);
      }
    }
  }

  return (
    <ContainerStyle>
      <div data-action-mode={actionMode} data-view-mode={viewMode} className={"App" + (loading ? "" : "")}>
        <SpinFC size="large" spinning={loading}>
          <div className='headerContainer'>
            <span className='searchInput'>
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={SetFilterOnBlur} 
                onKeyDown={BlurOnReturn} 
                addonBefore={BuildSearchAddon(searchValue)} 
                placeholder="Search" 
              />
            </span>
            <span className="focusMessageContainer">
              {
                GetFocusElement()
              }
            </span>
            <span className='actionButtons'>
              {
                actionMode == "Normal" ? 
                <Select options={[
                    {
                      label: "Normal",
                      value: "Normal",
                    },
                    {
                      label: "Delete",
                      value: "Delete",
                    },
                    {
                      label: "Restore",
                      value: "Restore",
                    }
                  ]}
                  value={actionMode}
                  onChange={(val) => setActionMode(val)}
                /> :
                <Space>
                  <Button onClick={(e) => {
                      selectedRecordReference.current = [];
                      setActionMode("Normal");
                    }} 
                    className='deleteButton'
                  >
                    Cancel
                  </Button>
                  <Button className='restoreButton'
                    onClick={(e) => {
                      if (selectedRecordReference.current.length == 0) 
                      {
                        message.error("No records are selected.");
                        message.info(`Click cancel to exit ${actionMode} mode`);
                        return;
                      }
                      if (actionMode == "Delete") {
                        HandleDelete();
                      } else if (actionMode == "Restore") {
                        HandleRestore();
                      }
                      selectedRecordReference.current = [];
                      setActionMode("Normal");
                    }}
                  >
                    Confirm
                  </Button>
                </Space>
              }

            </span>
          </div>
          <Table
            ref={tableRef}
            showSorterTooltip={
              {
                title: "Toggle Sort",
                overlayStyle: {
                  userSelect: "none",
                  pointerEvents: "none"
                }
              }
            }
            scroll={{
              x: "auto",
              
            }}
            
            key={tableKey}
            pagination={{
              current: selectedLocalPage,
              defaultPageSize: pageSize,
              pageSize: pageSize,
              pageSizeOptions: [5,10,15,20,50,100],
              size: "default",
              position: ["bottomCenter"],
              onChange: (pageIndex, pageSize) => { setSelectedLocalPage(pageIndex); setPageSize(pageSize) },
              showSizeChanger: true,
              nextIcon: !IsOnLastPage() ? undefined : 
                <div style={{cursor: "pointer"}} onClick={LoadNextPage}>
                  <PlusCircleOutlined className='icon' />
                </div>
            }}
            //tableLayout= "fixed"
            dataSource={filteredCache as any} 
            columns={columns as any} 
            rowKey={(d) => d ? ExtractID(d.url) : ""}
            footer={GetNumberOfLoadedPages() >= GetCurrentTotalPages() ? undefined : BuildFooter}
            rowClassName={
              (r:SWBaseAPIRecord) => {
                let id = ExtractID(r.url);
                if (selectedRecordReference.current.indexOf(id) == -1) {
                  return "";
                }
                return "selected";
              }
            }
            onRow={
              (record,index) => {
                return {
                  onClick: (e) => {
                    if (actionMode == "Normal") { return; }
                    e.stopPropagation();
                    let mutableSelectedRecords = [...selectedRecordReference.current];
                    let id = ExtractID(record.url);
                    let index = mutableSelectedRecords.indexOf(id);
                    if (index != -1) {
                      mutableSelectedRecords.splice(index,1);
                    } else {
                      mutableSelectedRecords.push(id);
                    }
                    console.log(id, mutableSelectedRecords);
                    selectedRecordReference.current = (mutableSelectedRecords);
        
                    setTableKey((state) => (state + 1) % 20);
                  }
                }
              }
            }
            
          />
        </SpinFC>
      </div>
        {/* <button onClick={() => { console.log("Test running"); starwarsStore[category].getPage(parseInt(window.prompt("Page") ?? "0"),false)}}>Load Page</button>
        <button onClick={() => { setLoading(!loading) }}>Toggle Loading</button> */}
    </ContainerStyle>

  );
}

export default StarwarsTable;
