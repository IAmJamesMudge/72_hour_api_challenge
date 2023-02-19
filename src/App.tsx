import React, { useEffect, useState } from 'react';
import './App.css';
import StarwarsTable from './components/StarwarsTable';
import { Space, Select } from "antd";
import StarwarsBarChart from './components/StarwarsChart';
import Styled from "styled-components";

const MainStyled = Styled.div`
    display: flex;
    justify-content: center;
    min-height: 500px;
    max-width: 95vw;
    margin: auto;
    padding: 5px 20px;
`;

function App() {
  const [storeKey, setStoreKey] = useState<"starshipStore" | "peopleStore" | "planetStore" | "speciesStore" | "vehicleStore" | "filmStore">("peopleStore");
  

  function ChangeCategory (value:string) 
  {
    setStoreKey(value as any);
  }
  
  return (
    <>
      <h1>Starwars API</h1>
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
      </Space>
      
      <MainStyled>
        <StarwarsTable changeCategory={ChangeCategory} category={storeKey} />
      </MainStyled>
      <hr />
      <MainStyled>
        <StarwarsBarChart category={storeKey} />
      </MainStyled>
    </>
  );
}

export default App;
