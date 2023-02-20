import { Button, Image, message, Popover, Skeleton, Space, Tag } from "antd";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components"
import useLoremStore, { CatPicData, BreedData, GetRandomCatLine } from "../APIs/cats";
import CatSVG from "../Assets/SVG/cat";
import CatPawSVG from "../Assets/SVG/catpaw";
import globals from "../Hooks/Globals";


const testString = `<https://picsum.photos/v2/list?page=1&limit=10>; rel="prev", <https://picsum.photos/v2/list?page=3&limit=10>; rel="next" `;

const SingleImageStyled = styled.div`
    position: relative;
    img {
        width: 250px !important;
        height: 250px !important;
        object-fit: cover;
        border-radius: 3px;
    }
`;
const ImagePopoverStyled = styled.div`
    display: flex;
    justify-content: space-between;
    width: 200px;
    .delete {
        border-color: rgba(200,0,0,1);
        color: rgba(200,0,0,1);

        &:hover {
            border-color: rgba(240,0,0,1);
            color: rgba(240,0,0,1);
        }
        &:active {
            border-color: rgba(255,30,30,1);
            color: rgba(255,30,30,1);
        }
    }
`;
const SubHeaderStyled = styled.div`
    width: 100%;

    .cat-fact 
    {
        font-size: 1.3rem;
        font-family: 'Gloria Hallelujah', cursive;
        display: grid;
        justify-content: center;
        align-content: center;
        justify-items: center;
        grid-template-columns: 30vw 1fr;
    }
    * {
        justify-self: left;
    }
    svg {
        width: 50px;
        height: 50px;
        position: relative;
        top: -5px;
        left: -12.5px;
        cursor:pointer;
        justify-self: right;
        text-shadow: 0px 1px 2px blue;
        transition: all 0.08s linear;
        filter: drop-shadow(0px 0px 5px rgb(0 50 30 / 0.2));
        transform: scale(1);
        animation: purrShake 3s infinite;
        fill: rgba(0,0,0,0.7);

        &:hover {
            animation: none;
            fill: rgba(0,0,0,0.8);
            transform: scale(1.075);
        }
        &:active {
            fill: rgba(0,0,0,1);
            transform: scale(0.98);
        }
    }
    @keyframes purrShake {
        0% { transform: rotate(0deg); }
        5% { transform: rotate(5deg); }
        10% { transform: rotate(0deg); }
        15% { transform: rotate(-5deg); }
        20% { transform: rotate(0deg); }
        100% { transform: rotate(0deg); }
    }
`

type SingleImageProps = {
    data:CatPicData;
    onDeleted:(data:CatPicData) => void;
    onFilter:(data:CatPicData) => void;
}
function SingleImage(props:SingleImageProps) {
    const [imageIsLoaded, setImageIsLoaded] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const hidePopoverTimeout = useRef(-1);

    useEffect(() => {
        let image = new window.Image();
        image.src = props.data.url;
        image.onload = () => setImageIsLoaded(true);
    },[props.data.url])

    function HandleDelete() 
    {
        props.onDeleted(props.data)
        setPopoverOpen(false);
    }
    function HandleFilter() 
    {
        props.onFilter(props.data)
        setPopoverOpen(false);
    }
    function ClearPopover() {
        setPopoverOpen(false);
        window.clearTimeout(hidePopoverTimeout.current);
    }
    function HandleMouseEnteredMain() 
    {
        setPopoverOpen(true);
        window.clearTimeout(hidePopoverTimeout.current);
    }
    function HandleMouseLeftMain() 
    {
        window.clearTimeout(hidePopoverTimeout.current);
        hidePopoverTimeout.current = window.setTimeout(() => {
            setPopoverOpen(false);
        }, 250);
    }
    function HandleMouseEnteredPopover() 
    {
        window.clearTimeout(hidePopoverTimeout.current);
    }
    function HandleMouseLeftPopover() {
        window.clearTimeout(hidePopoverTimeout.current);
        hidePopoverTimeout.current = window.setTimeout(() => {
            setPopoverOpen(false);
        }, 250);
    }

    return (
        <SingleImageStyled>
            {
                imageIsLoaded && props.data.url && props.data.url != "" ?
                    <div onMouseLeave={HandleMouseLeftMain}  onMouseEnter={HandleMouseEnteredMain}>
                        <Popover
                            open={popoverOpen}
                            content={
                                <ImagePopoverStyled  onMouseEnter={HandleMouseEnteredPopover} onMouseLeave={HandleMouseLeftPopover}> 
                                    <Button onClick={HandleDelete} className='delete'>Delete</Button>
                                    <Button onClick={HandleFilter} className='filter'>Filter Breed</Button>
                                </ImagePopoverStyled>
                            }
                            title = "Actions"
                        >
                            <div>
                                <Image onClick={ClearPopover} loading="eager" src={props.data.url} />
                            </div>
                        </Popover>
                    </div>

                :
                    <Skeleton.Image style={{width:"250px", height: "250px"}} active={true} />
            }

             
        </SingleImageStyled>
    )
}

const ContainerStyled = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    row-gap: 20px;
    column-gap: 20px;

`;
const FixedHeaderStyled = styled.div`
    position: fixed;
    width: calc(100% + 48px);
    height: 60px;
    background-color: ${globals.catColor.rgb().toString()};
    margin: -24px;
    z-index: 99999999;
    padding: 3px 15px;
    .tag {
        position: fixed;
        font-family: 'Gloria Hallelujah', cursive;
        font-size: 1.5rem;
        color: white;
        animation: purrShake 3s infinite ease-in;
        transform-origin: 50% 50%;
    }
    .filterBar 
    {
        z-index: 99999999;
        position: absolute;
        background-color: white;
        box-shadow: 0 10px 25px -25px silver;
        width: calc(100vw - 265px);
        height: 80px;
        left: 0;
        top: 100%;
        display: grid;
        align-content: center;
        justify-content: center;
        text-align: center;
        padding-bottom: 10px;
        
        .filter-tag {
            transform: scale(1.2);
        }
    }
    .title {
        position: fixed;
        font-family: 'Gloria Hallelujah', cursive;
        font-size: 1.8rem;
        color: rgba(240,240,240,1);
        left: calc(50% - 20px);
        top: -3px;

        svg {
            position: relative;
            width: 45px;
            height: 45px;
            top: 10px;
            left: -5px;
            fill: rgba(240,240,240,1);
        }
    }
    @keyframes purrShake {
        0% { transform: rotate(0deg) scale(1); }
        5% { transform: rotate(5deg) scale(1.05); }
        10% { transform: rotate(0deg) scale(1.05); }
        15% { transform: rotate(-5deg) scale(1.05); }
        20% { transform: rotate(0deg) scale(1); }
        100% { transform: rotate(0deg) scale(1); }
    }
`;

export default function Catstagram() 
{
    const catStore = useLoremStore();
    const [usableData, setUsableData] = useState<CatPicData[]>([]);
    const [breedFilter, setBreedFilter] = useState<BreedData[]|null>(null);
    const [deletedIDs, setDeletedIDs] = useState<string[]>([]);
    const pageSize = useRef(10);
    const [catLine, setCatLine] = useState("");
    const imageContainerReference = useRef<HTMLDivElement>(null as any);

    useEffect(() => {
        if (!catStore.isLoading) {
            setUsableData(catStore.cache.filter((data,index,arr) => 
                {
                    if (data == undefined || data == null) {
                        return false;
                    }
                    if (deletedIDs.length > 0) {
                        if (deletedIDs.indexOf(data.id) != -1){
                            return false;
                        }
                    }

                    if (breedFilter != null && breedFilter.length > 0) {
                        for (let x = 0; x < data.breeds.length; x++) {
                            let dataIsValid = false;
                            for (let y = 0; y < breedFilter.length; y++) {
                                if (breedFilter[y].id == data.breeds[x].id) {
                                    dataIsValid = true;
                                    break;
                                }
                            }
                            if (!dataIsValid) {
                                return false;
                            }
                        }
                    }

                    return true;
                }
            ))
        }
    },[catStore, breedFilter, deletedIDs]);

    //initial load. One-time setup
    useEffect(() => {
        LoadNextPage(20);
        GetANewCatLine();
    },[])

    useEffect(() => {
        function HandleScroll(e:Event) {

            if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
                console.log("Scrolled to bottom");
                LoadNextPage(pageSize.current);
            }
        }
        window.addEventListener("scroll",HandleScroll);

        return () => {
            window.removeEventListener("scroll",HandleScroll);
        }
    })

    function GetANewCatLine() {
        setCatLine(GetRandomCatLine());
    }

    function AddTemporarySkeletons(count:number) 
    {
        let mutableData = JSON.parse(JSON.stringify(usableData));
        for (let x = 0; x < count; x++) {
            mutableData.push({url: ""});
        }

        setUsableData(mutableData);
    }

    function LoadNextPage(count?:number) {
        if (catStore.isLoading) { return; }
        
        AddTemporarySkeletons(count != undefined ? count : pageSize.current);
        catStore.loadImages(count != undefined ? count : pageSize.current).then(() => {
            console.log("Done loading lorem page", catStore.cache);
        }).catch((e) => {
            message.error("Server Error!");
        });
    }

    function HandleDelete(item:CatPicData) 
    {
        let mutableDeletedIDs = [...deletedIDs];

        mutableDeletedIDs.push(item.id);

        setDeletedIDs(mutableDeletedIDs);
    }
    function HandleFilter(item:CatPicData) {
        setBreedFilter(item.breeds);

        console.log("Filtering:",item.breeds);
    }
    function HandleBreedRemovedFromFilter(breed:BreedData) {
        let breedCopy = JSON.parse(JSON.stringify(breedFilter)) as BreedData[];
        for (let x = 0; x < breedCopy.length; x++) {
            if (breed.id == breedCopy[x].id) {
                breedCopy.splice(x,1);
            }
        }
        setBreedFilter(breedCopy);

        console.log("Setting filter:",breedCopy);
    }

    return (
        <div>
            <FixedHeaderStyled>
                <div className='tag'>
                    puuurrrrfect
                </div>
                <div className='title'>
                    <span>
                        <CatPawSVG />
                    </span>
                    <span>
                        Catstagram
                    </span>
                </div>
                <div className="filterBar">
                    <Space direction="vertical">
                        <div style={{fontSize: "1.5rem"}}>
                            Filtered Breeds
                        </div>
                        <div>
                            {
                                breedFilter && breedFilter.length > 0 ? breedFilter.map((filter, index) => {
                                    return (
                                        <Tag color={globals.catColor.rgb().toString()} className="filter-tag" key={index} closable onClose={() => HandleBreedRemovedFromFilter(filter)}>
                                            {filter.name}
                                        </Tag>
                                    )
                                }) :
                                ""
                            }
                        </div>
                    </Space>



                </div>
            </FixedHeaderStyled>
            <div style={{height:120}} />
            <SubHeaderStyled>
                <div className='cat-fact' style={{width: "100%", height:120}}>
                    
                    <CatSVG onClick={() => GetANewCatLine()} />
                    <div>
                        {catLine}
                    </div>
                </div>
            </SubHeaderStyled>





            <ContainerStyled ref={imageContainerReference}>
                {
                    usableData.map((d,i) => {
                        return <SingleImage key={i} onFilter={HandleFilter} onDeleted={HandleDelete} data={d} />
                    })
                }
            </ContainerStyled>
        </div>
    )
}