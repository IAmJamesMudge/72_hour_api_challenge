import { Chart as ChartJS, ChartData, registerables} from 'chart.js'
import { Chart } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { FilterStoreData, People, Planet, StoreType, SWBaseAPIRecord, useStarWarsStores } from "../APIs/starwars";
import useDeletedRecordTracker from "../Hooks/DeletedRecordTracker";
import useFocusedRecorderTracker from '../Hooks/FocusRecordTracker';
import Color from "color";
import Styled from "styled-components";
import { Col, Form, Row, Select, Space, Switch, Tooltip } from 'antd';
import Typography from 'antd/es/typography/Typography';
import Title from 'antd/es/typography/Title';

ChartJS.register(...registerables);

const colorMax = Color.rgb("rgb(70,135,255)");
const colorMin = Color.rgb("rgb(173, 154, 255)");

function lerpRGB(color1:Color, color2:Color, t:number) {
    
    let red = (color1.red() + ((color2.red() - color1.red()) * t));
    let green = (color1.green() + ((color2.green()- color1.green()) * t));
    let blue = (color1.blue() + ((color2.blue() - color1.blue()) * t));

    return Color.rgb(red,green,blue);
}

type ComparableFieldData = {
    propertyName:string;
    label:string;
    sorter?: (a:any,b:any) => number
}

const storeToComparableFields:Map<StoreType,ComparableFieldData[]> = new Map([
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
])

type props = {
    category: StoreType
}
export default function StarwarsBarChart({category}:props) {
    const starwarsStore = useStarWarsStores();
    const [barData, setBarData] = useState<ChartData<"bar">>(null as any);
    const deletedRecordStore = useDeletedRecordTracker();
    const focusedRecordStore = useFocusedRecorderTracker();
    const [filteredCache, setFilteredCache] = 
      useState(FilterStoreData(starwarsStore[category].cache,"",[],deletedRecordStore[category], focusedRecordStore[category], true) as SWBaseAPIRecord[]);
    const [sortingOn, setSortingOn] = useState(false);
    const [comparisonField, setComparisonField] = useState("Select Field");
    const [normalizeDataOn, setNormalizeDataOn] = useState(false);

    useEffect(() => {
        let filteredData = FilterStoreData(starwarsStore[category].cache,"",[],deletedRecordStore[category],focusedRecordStore[category],true);

        setFilteredCache(filteredData as SWBaseAPIRecord[]);
    },[deletedRecordStore, focusedRecordStore, category, starwarsStore[category].cache])
    
    useEffect(() => {
        let sortingFunction = (a:any,b:any) => {
            let d0:any = b[comparisonField];
            let d1:any = a[comparisonField];
            let f0 = parseFloat(d0);
            if (!isNaN(f0)) {
                d0 = f0;
            }
            let f1 = parseFloat(d1);
            if (!isNaN(f1)) {
                d1 = f1;
            }
            if (typeof(d0) == "string" && typeof(d1) == "number"){
                return -1;
            }
            if (typeof(d1) == "string" && typeof(d0) == "number"){
                return 1;
            }
            if ( (d0 == null || d0 == undefined) && !(d1 == null || d1 == undefined)) {
                return -1
            }
            if ( !(d0 == null || d0 == undefined) && (d1 == null || d1 == undefined)) {
                return 1
            }
            return d0 - d1;
        };
        let tmpCache = JSON.parse(JSON.stringify(filteredCache));
        
        if (sortingOn) {
            tmpCache.sort(sortingFunction);
        }

        let filteredSortedBarData = tmpCache.map((p:any) => parseFloat(p[comparisonField]));

        if (normalizeDataOn) 
        {
            let maxValue = 0;
            for (let x = 0; x < filteredSortedBarData.length; x++) 
            {
                let val = filteredSortedBarData[x];
                if (isNaN(val) || typeof(val) != "number") {continue;}

                maxValue = Math.max(maxValue,val);
            }
            for (let x = 0; x < filteredSortedBarData.length; x++) 
            {
                let val = filteredSortedBarData[x];
                if (typeof(val) != "number") {continue;}
                val = val / maxValue;
                filteredSortedBarData[x] = val;
            }
        }

        let maxIndex = filteredSortedBarData.length - 1;

        let data:ChartData<"bar"> = {
            labels: tmpCache.map((p:any) => p.name),
            datasets: [{
                label: comparisonField,
                borderColor: "rgb(29, 22, 97)",
                backgroundColor: (barContext,data) => {
                    let index = barContext.dataIndex;

                    return lerpRGB(colorMax,colorMin, index / maxIndex).toString();
                },
                borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                },
                borderWidth: 2,
                data: filteredSortedBarData,
            }]
        }
        setBarData(data);
    },[sortingOn, filteredCache, comparisonField, normalizeDataOn])

    function IsCategoryValid() {
        let arr = storeToComparableFields.get(category);

        return arr != undefined && arr.length > 0;
    }

    return (
        <div style={{width: "100%", maxWidth: "70vw", maxHeight: "450px"}}>
            <div style={{display: IsCategoryValid() ? "none" : "block"}}>
                <h3>There is no data to bar graph for this category</h3>
            </div>
            <Row gutter={[8,8]} style={{display: IsCategoryValid() ? "block" : "none"}}>
                <Row>
                    <div style={{width: "100%"}}>
                        <Typography>
                            Bar Graph Control Panel
                            <hr />
                        </Typography>
                    </div>
                    <div>
                        <Form 
                            labelCol={{span: 12}}
                            wrapperCol={{span: 12}}
                            layout="horizontal"
                            style ={{
                                display: "flex",
                                columnGap: "12px"
                            }}
                        >
                            <Tooltip title="Sort High -> Low">
                                <div>
                                    <Form.Item label="Sort" valuePropName='checked'>
                                        <Switch checked={sortingOn} onChange={() => setSortingOn(!sortingOn)} />
                                    </Form.Item>
                                </div>
                            </Tooltip>

                            <Tooltip title="Show all data a percentage of the maximum value">
                                <div>
                                    <Form.Item style={{width: "150px"}} label="Normalize" valuePropName='checked'>
                                        <Switch checked={normalizeDataOn} onChange={() => setNormalizeDataOn(!normalizeDataOn)} />
                                    </Form.Item>
                                </div>

                            </Tooltip>

                            <Form.Item noStyle extra={<div>extra</div>} label="" valuePropName='value'>
                                <Row>
                                        <div style={{opacity: 0.75, position: "relative", top: "4px", marginRight: "6px"}}>
                                            Field
                                        </div>
                                        <Select 
                                            style={{width: "120px"}}
                                            value={comparisonField} 
                                            options={storeToComparableFields.get(category)?.map(d => {
                                                return {
                                                    value: d.propertyName,
                                                    label: d.label,
                                                }
                                            })}
                                            onChange={(val) => setComparisonField(val)}
                                        />

                                </Row>

                            </Form.Item>
                        </Form>
                    </div>
                </Row>
                <Row>
                    { 
                        filteredCache.length > 0 ?
                            <>
                                <Bar
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            tooltip: {
                                                intersect: false
                                            }
                                        }
                                    }}
                                    data={barData} 
                                /> 
                            </>
                            : 
                            "Waiting for data to load..." 
                    }
                </Row>
            </Row>
        </div>
    )
}