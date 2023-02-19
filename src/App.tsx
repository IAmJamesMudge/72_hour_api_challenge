import React, { useEffect, useState } from 'react';
import './App.css';
import StarwarsTable from './components/StarwarsTable';
import { Space, Layout, Tooltip } from "antd";
import StarwarsBarChart from './components/StarwarsChart';
import Styled from "styled-components";
import { Header, Content, Footer } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import logoImage from "./Assets/Images/clubwealthlogo.png";

import { HourglassFilled, UserOutlined } from '@ant-design/icons';
import CatSVG from './Assets/SVG/cat';
import StarwarsSVG from './Assets/SVG/starwars';
import JamesMudgeLogoSVG from './Assets/SVG/creativity';
import PeopleSVG from './Assets/SVG/person';
import RocketSVG from './Assets/SVG/rocket';
import PlanetSVG from './Assets/SVG/planet';
import SpeciesSVG from './Assets/SVG/species';
import VehicleSVG from './Assets/SVG/vehicle';
import FilmSVG from './Assets/SVG/film';

const HeaderStyled = Styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: center;

  .icon {
    width: 30px;
    height: 30px;
    fill: white;
    justify-self: right;
  }

  div {
    text-align: right;
    font-size: 1.5rem;
    opacity: 0.75;
    transition: opacity 0.1s linear;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
    &:active {
      opacity: 1;
    }
  }
`;

const SelfPromotionStyled = Styled.div`
  position: absolute;
  bottom: 0px;
  left: 00px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  align-content: center;
  padding: 20px 0px 20px 20px;
  background-color: rgba(255,255,255,0.1);
  transition: all 0.1s linear;
  cursor: pointer;

  &:hover {
    background-color: rgba(255,255,255,0.125);
  }
  &:active {
    background-color: rgba(255,255,255,0.15);
  }

  .weblink {
    color: white;
  }

  svg {
    width: 45px;
    height: 45px;
  }
`;

function SelfPromotion() {
  return (
    <SelfPromotionStyled onClick={() => window.open("https://www.iamjamesmudge.com")}>
      <div>
        <JamesMudgeLogoSVG />
      </div>
      <div className='weblink'>
        James Mudge
      </div>
    </SelfPromotionStyled>
  )
}

type DataChoice = "Starwars" | "Cats";

const starwarsCategories = [
  { storeKey: "peopleStore", label: "People", svg: <UserOutlined />},
  { storeKey: "starshipStore", label: "Starships", svg: <RocketSVG /> },
  { storeKey: "planetStore", label: "Planets", svg: <PlanetSVG />},
  { storeKey: "speciesStore", label: "Species", svg: <SpeciesSVG /> },
  { storeKey: "vehicleStore", label: "Vehicles", svg: <VehicleSVG /> },
  { storeKey: "filmStore", label: "Films", svg: <FilmSVG /> },
]

function App() {
  const [storeKey, setStoreKey] = useState<"starshipStore" | "peopleStore" | "planetStore" | "speciesStore" | "vehicleStore" | "filmStore">("peopleStore");
  const [dataChoice, setDataChoice] = useState<DataChoice>("Starwars");
  const [siderWidth, setSiderWidth] = useState(200);

  function ChangeCategory (value:string) 
  {
    setStoreKey(value as any);
  }
  
  return (
    <Layout style={{minHeight: "100vh"}}>
      <Layout>
        <div style={{width: siderWidth, height: "100vh"}}></div>
        <Sider width={siderWidth} style={{ position: "fixed", height: "100vh", backgroundColor: "geekblue", padding: "0px 16px", userSelect: "none"}}>
          <Header style={{display: "flex", alignItems: "center", justifyContent: "center", margin: "auto", padding: "0px"}}>
            <div style={{color: "white"}}>
              <img src={logoImage} style={{height: "36px", position: "relative", top: "10px", left: "-5px"}} />
            </div>
          </Header>
          <hr style={{opacity: 0.5, width: "calc(100% + 32px)", position: "relative", left: "-16px"}}/>

          <HeaderStyled style={{color: "white"}}>
              <h2>{dataChoice}</h2>
              <Tooltip title={`Change Data To ${dataChoice == "Starwars" ? "Cats" : "Starwars"}`}>
                <div className='icon' onClick={e => setDataChoice(dataChoice == "Starwars" ? "Cats" : "Starwars")}>
                  {
                    dataChoice == "Starwars" ?
                      <CatSVG /> :
                      <StarwarsSVG />
                  }
                </div>
              </Tooltip>

          </HeaderStyled>

          <Space style={{width: "100%"}} size={2} direction='vertical'>
                {
                  dataChoice == "Starwars" ?
                    starwarsCategories.map(sc => 
                      <SiderButton onClick={() => setStoreKey(sc.storeKey as any)} className={sc.storeKey == storeKey ? "selected" : ""}>
                        <div className='icon'>
                          {sc.svg}
                        </div>
                        {sc.label}
                      </SiderButton>)
                  : ""
                }
          </Space>

          <SelfPromotion />
        </Sider>
        <Layout>
          <Content
            style={{
              padding: 24,
              margin: 0,
              background: "white",
            }}
          >
            <StarwarsTable changeCategory={ChangeCategory} category={storeKey} />
          </Content>
        </Layout>
      </Layout>
    </Layout>
      /* <h1>Starwars API</h1>
      <Space wrap={true}>
        <Select 
          value={storeKey}
          style={{width: 120}}
          onChange={ChangeCategory}
          options={[
            { value: "peopleStore", label: "People" },
            { value: "planetStore", label: "Planets" },
            { value: "starshipStore", label: "Starships" },
            { value: "speciesStore", label: "Species" },
            { value: "vehicleStore", label: "Vehicles" },
            { value: "filmStore", label: "Films" },
          ]}
        />
      </Space> */
      /* <StarwarsTable changeCategory={ChangeCategory} category={storeKey} />
        <hr />
      <StarwarsBarChart category={storeKey} /> */
  );
}

const SiderButtonStyle = Styled.div`
  color: white;
  padding: 7px 10px;
  background-color: rgba(170,170,170,0.025);
  width: 100%;
  border-radius: 2px;
  font-size: 1.1em;
  transition: background-color 0.1s linear;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: rgba(170,170,170,0.5);
  }
  &:active {
    transition: background-color 0.05s linear;
    background-color: rgba(170,170,170,0.7);
  }

  &.selected {
    box-shadow: 0px 0px 0px 1000px rgba(170,170,170,0.5) inset;
  }

  .icon {
    height: 15px;
    width: 15px;
    fill: white;
    float: left;
  }
`;
type SiderButtonProps = {
  children:React.ReactNode;
  className?:string;
  onClick?:(e:React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
function SiderButton(props:SiderButtonProps) {

  return (
    <SiderButtonStyle onClick={props.onClick} className={props.className}>
        {props.children}
    </SiderButtonStyle>
  )
}

export default App;
