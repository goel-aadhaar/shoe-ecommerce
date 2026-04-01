
import FilterBar from "../filter"
import shoes from "../../data/shoes.json"

import ShoeList from "../shoe_list"
function BrandFullPage() {
  console.log("Call from BrandFullPage...  ");
  console.log(shoes);
  
  
  return (
    <>
      <FilterBar/>
      <ShoeList
        props={shoes}
      />
    </>
  )
}

export default BrandFullPage