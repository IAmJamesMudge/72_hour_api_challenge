import { Chart as ChartJS, ChartData, registerables} from 'chart.js'
import { Chart } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { FilterStoreData, People, Planet, storeToComparableFields, StoreType, SWBaseAPIRecord, useStarWarsStores } from "../APIs/starwars";
import useDeletedRecordTracker from "../Hooks/DeletedRecordTracker";
import useFocusedRecorderTracker from '../Hooks/FocusRecordTracker';
import Color from "color";
import Styled from "styled-components";
import { Col, Form, message, Row, Select, Space, Switch, Tooltip } from 'antd';
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


type props = {
    category: StoreType;
    filteredSortedData:SWBaseAPIRecord[];
}
export default function StarwarsBarChart(props:props) {
    const [barData, setBarData] = useState<ChartData<"bar">>(false as any);
    const [comparisonField, setComparisonField] = useState("Select Field");
    
    useEffect(() => {

        let maxIndex = props.filteredSortedData.length - 1;

        console.log("Attempting to make bar data out of: " , props.filteredSortedData);

        let metaData = props.filteredSortedData.map((d:any) => d[comparisonField]);

        let data:ChartData<"bar"> = {
            labels: props.filteredSortedData.map((d:any) => Object.hasOwn(d,"name") ? d.name : d.title),
            datasets: [{
                metaData: metaData,
                label: comparisonField,
                borderColor: "rgb(29, 22, 97)",
                backgroundColor: (barContext:any,data:any) => {
                    let index = barContext.dataIndex;

                    return lerpRGB(colorMax,colorMin, index / maxIndex).toString();
                },
                borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                },
                borderWidth: 2,
                data: props.filteredSortedData.map((d:any) => parseFloat(d[comparisonField])),
            }] as any
        }
        setBarData(data);
    },[props.filteredSortedData, comparisonField])

    useEffect(() => {
        let data = storeToComparableFields.get(props.category);
        if (data && data.length >0){
            setComparisonField(data[0].propertyName);
        } else {
            setBarData(false as any);
        }

    },[props.category])

    return (
        <div>
            <div>
                <div>
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
                            <Form.Item noStyle extra={<div>extra</div>} label="" valuePropName='value'>
                                <Row>
                                    <div style={{opacity: 0.75, position: "relative", top: "4px", marginRight: "6px"}}>
                                        Field
                                    </div>
                                    <Select 
                                        style={{width: "120px"}}
                                        value={comparisonField} 
                                        options={storeToComparableFields.get(props.category)?.map(d => {
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
                </div>
                <Row>
                {
                    barData ?
                        <Bar
                            style={{
                                height: "65vh",
                                maxHeight: "65vh"
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    tooltip: {
                                        intersect: false,
                                        callbacks: {
                                            // title(items)  {
                                            //     if (items.length > 0) {
                                            //         let item = items[0];
                                            //         return "title test";
                                            //     }
                                            // },
                                            label(item) {
                                                return (item.dataset as any).metaData[item.dataIndex];
                                            },
                                            // footer(items) {
                                            //     items[0].label = "footer test";
                                            //     return "foot test";
                                            // }
                                        }
                                    }
                                }
                            }}
                            data={barData} 
                        /> :
                        "Loading..."
                }

                </Row>
            </div>
        </div>
    )
}