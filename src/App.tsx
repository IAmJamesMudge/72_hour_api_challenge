import React, { useEffect, useState } from 'react';
import './App.css';
import StarwarsTable from './components/StarwarsTable';
import { Space, Layout, Tooltip, Select } from "antd";
import StarwarsBarChart from './components/StarwarsChart';
import styled from "styled-components";
import { Header, Content, Footer } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import logoImage from "./Assets/Images/clubwealthlogo.png";

import { HourglassFilled, UserOutlined } from '@ant-design/icons';
import CatSVG from './Assets/SVG/cat';
import StarwarsSVG from './Assets/SVG/starwars';
import JamesMudgeLogoSVG from './Assets/SVG/creativity';
import RocketSVG from './Assets/SVG/rocket';
import PlanetSVG from './Assets/SVG/planet';
import SpeciesSVG from './Assets/SVG/species';
import VehicleSVG from './Assets/SVG/vehicle';
import FilmSVG from './Assets/SVG/film';
import pawsPNG from "./Assets/Images/paws.png";
import Catstagram from './components/Catstagram';
import globals from './Hooks/Globals';

const HeaderStyled = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: center;

  .icon {
    width: 30px;
    height: 30px;
    fill: white;
    justify-self: right;
  }

  .dataChoiceSelect {
    position: relative;
    left: -12px;
    margin-bottom: 15px;
    
    .label {
      color: black;
      position: absolute;
      left: 0;
      top: 0;

      svg {
        position: absolute;
        left: calc(100% + 20px);
        top: calc(50% + 2px);
        height: 20px;
        width: 20px;
        transform: translateY(-50%);
        pointer-events: none;
      }

      &.starwars {
        text-shadow: 1px 1px 2px rgba(255,0,0,0.5);
      }
    }
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

const CatSiderStyled = styled.div`
  img {
    position: relative;
    top: -30px;
    max-height: 80vh;
    opacity: 0.5;
    pointer-events: none;
  }
`;

const SelfPromotionStyled = styled.div`
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



const SiderButtonStyle = styled.div`
  color: white;
  padding: 12.5px 10px;
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

    .icon {
      fill: white;

      &.user {
        color: white;
      }
    }
  }

  .icon {
    height: 25px;
    width: 25px;
    fill: silver;
    float: left;

    &.user {
      position: relative;
      left: 2px;
      height: unset;
      width: unset;
      font-size: 25px;
      color: silver;
    }
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

type DataChoice = "Starwars" | "Cats";

const starwarsCategories = [
  { storeKey: "peopleStore", label: "People", svg: <UserOutlined className="icon user" />},
  { storeKey: "starshipStore", label: "Starships", svg: <RocketSVG /> },
  { storeKey: "planetStore", label: "Planets", svg: <PlanetSVG />},
  { storeKey: "speciesStore", label: "Species", svg: <SpeciesSVG /> },
  { storeKey: "vehicleStore", label: "Vehicles", svg: <VehicleSVG /> },
  { storeKey: "filmStore", label: "Films", svg: <FilmSVG /> },
]

function App() {
  const [storeKey, setStoreKey] = useState<"starshipStore" | "peopleStore" | "planetStore" | "speciesStore" | "vehicleStore" | "filmStore">("peopleStore");
  const [dataChoice, setDataChoice] = useState<DataChoice>("Cats");
  const [siderWidth, setSiderWidth] = useState(250);

  function ChangeCategory (value:string) 
  {
    setStoreKey(value as any);
  }

  function GetMainColor() {
    switch (dataChoice) {
      case "Cats":
        return globals.catColor.rgb().toString();
      case "Starwars":
        return globals.starwarsColor.rgb().toString();
    }
  }
  
  return (
    <Layout style={{minHeight: "100vh"}}>
      <Layout style={{background: "transparent"}}>
        <div style={{width: siderWidth, height: "100vh"}}></div>
        <Sider width={siderWidth} style={{ position: "fixed", height: "100vh", backgroundColor: GetMainColor(), padding: "0px 16px", userSelect: "none"}}>
          <Header style={{background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", margin: "auto", padding: "0px"}}>
            <div style={{color: "white"}}>
              <img src={logoImage} style={{height: "36px", position: "relative", top: "10px", left: "-5px"}} />
            </div>
          </Header>
          <hr style={{opacity: 0.5, width: "calc(100% + 32px)", position: "relative", left: "-16px", top: "-12px"}}/>

          <HeaderStyled style={{color: "white"}}>
              <Select
                className='dataChoiceSelect'
                style ={{width: siderWidth - 10}}
                value = {dataChoice}
                onChange={(val) => setDataChoice(val)}
                options={[
                  {label: <div className='label starwars'>Starwars <StarwarsSVG /></div>, value: "Starwars"},
                  {label: <div className='label'>Cats <CatSVG /></div>, value: "Cats"}
                ]}
                dropdownMatchSelectWidth={true}
                dropdownRender={(node) => {

                  return <span className='dropdown'>
                    {node}
                  </span>
                }}
              />
              {/* <h2>{dataChoice}</h2>
              <Tooltip title={`Change Data To ${dataChoice == "Starwars" ? "Cats" : "Starwars"}`}>
                <div className='icon' onClick={e => setDataChoice(dataChoice == "Starwars" ? "Cats" : "Starwars")}>
                  {
                    dataChoice == "Starwars" ?
                      <CatSVG /> :
                      <StarwarsSVG />
                  }
                </div>
              </Tooltip> */}

          </HeaderStyled>

          <Space style={{width: "100%"}} size={2} direction='vertical'>
                {
                  dataChoice == "Starwars" ?
                    starwarsCategories.map((sc, index) => 
                      <SiderButton key={index} onClick={() => setStoreKey(sc.storeKey as any)} className={sc.storeKey == storeKey ? "selected" : ""}>
                        <div className='icon'>
                          {sc.svg}
                        </div>
                        {sc.label}
                      </SiderButton>)
                  : 
                  <CatSiderStyled>
                    <img style={{width: siderWidth * 0.8}} src={pawsPNG} />
                  </CatSiderStyled>
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
            {
              dataChoice == "Starwars" ?
                <StarwarsTable changeCategory={ChangeCategory} category={storeKey} />
              :
                <Catstagram />
            }
            
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
