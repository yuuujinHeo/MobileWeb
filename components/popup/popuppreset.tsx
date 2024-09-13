// import React, {useState} from 'react';
// import { Button } from "primereact/button";
// import { InputText } from 'primereact/inputtext';
// import { Dialog } from "primereact/dialog";
// import { DataView } from "primereact/dataview";

// interface PopupProps {
//     visible: boolean;
//     setValue: React.Dispatch<React.SetStateAction<string>>;
//     setVisible: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const PopipPreset = React.memo<PopupProps>(({visible, setValue, setVisible}) => {
//     const cm = useRef<ContextMenu>(null);
//     const [selectPreset, setSelectPreset] = useState<number | null>(null);
//     const [cur, setCur] = useState<PresetSetting>();
//     const [blocked, setBlocked] = useState(false);
//     const menus = [
//         // {label: '번호변경', icon: 'pi pi-file-edit', command:()=>{
//         //     if(selectPreset!=null){
//         //         changeNumber
//         // }}},
//         {label: '삭제', icon: 'pi pi-trash', command:()=>{
//             console.log("delete",selectPreset)
//             if(selectPreset!=null){
//                 deletePreset();
//         }}},
//         {label: '복사', icon: 'pi pi-clone', command:()=>{
//             if(selectPreset!=null){
//                 copyPreset();
//             }
//         }},
//     ];

//     const formik_preset = useFormik({
//         initialValues:{
//             LIMIT_V:        cur?.LIMIT_V,
//             LIMIT_W:        cur?.LIMIT_W,
//             LIMIT_V_ACC:    cur?.LIMIT_V_ACC,
//             LIMIT_W_ACC:    cur?.LIMIT_W_ACC,
//             LIMIT_PIVOT_W:  cur?.LIMIT_PIVOT_W,
//             PP_MIN_LD:      cur?.PP_MIN_LD,
//             PP_MAX_LD:      cur?.PP_MAX_LD,
//             PP_ST_V:        cur?.PP_ST_V,
//             PP_ED_V:        cur?.PP_ED_V
//         },
//         enableReinitialize: true,
//         validate: (values) => {
//             const errors = {
//                 LIMIT_V:        "",
//                 LIMIT_W:        "",
//                 LIMIT_V_ACC:    "",
//                 LIMIT_W_ACC:    "",
//                 LIMIT_PIVOT_W:  "",
//                 PP_MIN_LD:      "",
//                 PP_MAX_LD:      "",
//                 PP_ST_V:        "",
//                 PP_ED_V:        ""
//             };
//             return errors;
//         },
//         onSubmit: (data) => {
//             console.log("SAVE : ",data);
//         }
//     });

//     const loadPreset = async(num:number|undefined=undefined) =>{
//         try{
//             if(num!= undefined){

//             }else if(selectPreset != null){
//                 num = selectPreset;
//             }else{
//                 return;
//             }

//             const response = await axios.get(mobileURL+'/setting/preset/'+num);
//             console.log(response.data);
//             setCur(response.data);
//             formik_preset.handleReset(response.data);
            
//         }catch(error){
//             console.error(error);
//         }
//     }
    
//     async function deletePreset(){
//         try{
//             console.log("delete")
//             const response = await axios.delete(mobileURL+'/setting/preset/'+selectPreset);
//             setPresets(response.data);
//             setSelectPreset(null);
//             setCur(undefined);
//         }catch(error){
//             console.error(error);
//         }
//     }
//     async function changeNumber(){

//     }
//     async function copyPreset(){
//         const num = getNextNumber();
//         try{
//             console.log(selectPreset);
//             const response = await axios.post(mobileURL+'/setting/preset/'+num,cur);
//             setSelectPreset(num);
//             setCur(response.data);
//             formik_preset.handleReset(response.data);
//             loadPresetList();
//         }catch(error){
//             console.error(error);
//         }

//     }
//     async function savePreset(){
//         try{
//             const response = await axios.put(mobileURL+'/setting/preset/'+selectPreset,formik_preset.values);
//             console.log(response);
//             setCur(response.data);
//             formik_preset.handleReset(response.data);
//         }catch(error){
//             console.error(error);
//         }
//     }

//     function getNextNumber(){
//         var max = -1;
//         for(const p of presets){
//             console.log(p);
//             if(max < p){
//                 max = p;
//             }
//         }
//         return max+1;
//     }

//     async function addPreset(){
//         const num = getNextNumber();
//         try{
//             const response = await axios.post(mobileURL+'/setting/preset/'+num);
//             console.log(response);
//             setSelectPreset(num);
//             setCur(response.data);
//             formik_preset.handleReset(response.data);
//             loadPresetList();
//         }catch(error){
//             console.error(error);
//         }
//     }

//     const onRightClick = (event: React.MouseEvent, preset: any) => {
//         if (cm.current) {
//             loadPreset(preset);
//             setSelectPreset(preset);
//             cm.current.show(event);
//         }
//     };

//     function refresh(){
//         loadPresetList();
//         formik_preset.handleReset(cur);
//     }

//     async function changePreset(nn:any){
//         setSelectPreset(nn)
//         loadPreset(nn);
//     }
//     return(
//         <Dialog header="속도 프리셋 설정" visible={visiblePreset} onHide={()=>setVisiblePreset(false)}>
//             <div className='column'>
//             <Toolbar start={
//                 <React.Fragment>
//                     <Button onClick={refresh} icon="pi pi-refresh" className='mr-2'></Button>
//                     <Button onClick={addPreset} icon="pi pi-plus" className='mr-2'></Button>
//                     <Button disabled={cur==undefined} onClick={deletePreset} icon="pi pi-trash" className='mr-2'></Button>
//                 </React.Fragment>
//                 } end={
//                     <Button onClick={savePreset} disabled={cur==undefined} label="저 장" icon="pi pi-check"></Button>
//                 }>
//             </Toolbar>
//             <div className='card grid'>
//                 <ul className="m-0 p-0 list-none border-1 surface-border border-round flex flex-column gap-3 w-full md:w-15rem " >
//                     {presets.map((p) => (
//                         <li
//                             key={p}
//                             className={`p-2 hover:surface-hover border-round border-1 border-transparent transition-all transition-duration-200 flex align-items-center justify-content-between ${selectPreset === p && 'border-primary'}`}
//                             onContextMenu={(event) => onRightClick(event, p)}
//                             onClick={(e) => changePreset(p)}
//                         >
//                         <div className="flex text-center items-center justify-center p-2 font-bold text-900 ">
//                             Preset {p}
//                         </div>
//                         </li>
//                     ))}
//                 </ul>
//                 <ContextMenu ref={cm} model={menus} onHide={() => setSelectPreset(null)} />
//                 <BlockUI blocked={cur==undefined} template={<i className="pi pi-lock" style={{ fontSize: '3rem' }}></i>}>
//                 <div className="card">
//                     <div className="column"> 
//                     <div className="grid gap-5"> 
//                         <div>
//                             <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_V</span>
//                             <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_V!==formik_preset.initialValues.LIMIT_V?"inline":"none", color:"red"}}>    (수정됨)</span></p>
//                             <InputNumber
//                                 name = "LIMIT_V"
//                                 value={formik_preset.values.LIMIT_V}
//                                 onValueChange={formik_preset.handleChange}
//                                 showButtons
//                                 step={0.1}
//                                 maxFractionDigits={3}
//                             ></InputNumber>
//                         </div>
//                         <div> 
//                             <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_W</span>
//                             <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_W!==formik_preset.initialValues.LIMIT_W?"inline":"none", color:"red"}}>    (수정됨)</span></p>
//                             <InputNumber
//                                 name = "LIMIT_W"
//                                 value={formik_preset.values.LIMIT_W}
//                                 onValueChange={formik_preset.handleChange}
//                                 showButtons
//                                 step={0.1}
//                                 maxFractionDigits={3}
//                             ></InputNumber>
//                         </div>
//                     </div>
//                     <div className="grid gap-5"> 
//                         <div> 
//                             <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_V_ACC</span>
//                             <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_V_ACC!==formik_preset.initialValues.LIMIT_V_ACC?"inline":"none", color:"red"}}>    (수정됨)</span></p>
//                             <InputNumber
//                                 name = "LIMIT_V_ACC"
//                                 value={formik_preset.values.LIMIT_V_ACC}
//                                 onValueChange={formik_preset.handleChange}
//                                 showButtons
//                                 step={0.1}
//                                 maxFractionDigits={3}
//                             ></InputNumber>
//                         </div>
//                         <div> 
//                             <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_W_ACC</span>
//                             <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_W_ACC!==formik_preset.initialValues.LIMIT_W_ACC?"inline":"none", color:"red"}}>    (수정됨)</span></p>
//                             <InputNumber
//                                 name = "LIMIT_W_ACC"
//                                 value={formik_preset.values.LIMIT_W_ACC}
//                                 onValueChange={formik_preset.handleChange}
//                                 showButtons
//                                 step={0.1}
//                                 maxFractionDigits={3}
//                             ></InputNumber>
//                         </div>
//                     </div>
//                     <div className="grid gap-5"> 
//                         <div> 
//                             <p ><span style={{fontSize:18,fontWeight: 700}}>LIMIT_PIVOT_W</span>
//                             <span style={{display:cur!==undefined&&formik_preset.values.LIMIT_PIVOT_W!==formik_preset.initialValues.LIMIT_PIVOT_W?"inline":"none", color:"red"}}>    (수정됨)</span></p>
//                             <InputNumber
//                                 name = "LIMIT_PIVOT_W"
//                                 value={formik_preset.values.LIMIT_PIVOT_W}
//                                 onValueChange={formik_preset.handleChange}
//                                 showButtons
//                                 step={0.1}
//                                 maxFractionDigits={3}
//                             ></InputNumber>
//                         </div>
//                         <div> 
//                             <p ><span style={{fontSize:18,fontWeight: 700}}>PP_MIN_LD</span>
//                             <span style={{display:cur!==undefined&&formik_preset.values.PP_MIN_LD!==formik_preset.initialValues.PP_MIN_LD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
//                             <InputNumber
//                                 name = "PP_MIN_LD"
//                                 value={formik_preset.values.PP_MIN_LD}
//                                 onValueChange={formik_preset.handleChange}
//                                 showButtons
//                                 step={0.1}
//                                 maxFractionDigits={3}
//                             ></InputNumber>
//                         </div>
//                     </div>
//                     <div className="grid gap-5"> 
//                         <div> 
//                             <p ><span style={{fontSize:18,fontWeight: 700}}>PP_MAX_LD</span>
//                             <span style={{display:cur!==undefined&&formik_preset.values.PP_MAX_LD!==formik_preset.initialValues.PP_MAX_LD?"inline":"none", color:"red"}}>    (수정됨)</span></p>
//                             <InputNumber
//                                 name = "PP_MAX_LD"
//                                 value={formik_preset.values.PP_MAX_LD}
//                                 onValueChange={formik_preset.handleChange}
//                                 showButtons
//                                 step={0.1}
//                                 maxFractionDigits={3}
//                             ></InputNumber>
//                         </div>
//                         <div> 
//                             <p ><span style={{fontSize:18,fontWeight: 700}}>PP_ST_V</span>
//                             <span style={{display:cur!==undefined&&formik_preset.values.PP_ST_V!==formik_preset.initialValues.PP_ST_V?"inline":"none", color:"red"}}>    (수정됨)</span></p>
//                             <InputNumber
//                                 name = "PP_ST_V"
//                                 value={formik_preset.values.PP_ST_V}
//                                 onValueChange={formik_preset.handleChange}
//                                 showButtons
//                                 step={0.1}
//                                 maxFractionDigits={3}
//                             ></InputNumber>
//                         </div>
//                     </div>
//                     <div className="grid gap-5"> 
//                         <div> 
//                             <p ><span style={{fontSize:18,fontWeight: 700}}>PP_ED_V</span>
//                             <span style={{display:cur!==undefined&&formik_preset.values.PP_ED_V!==formik_preset.initialValues.PP_ED_V?"inline":"none", color:"red"}}>    (수정됨)</span></p>
//                             <InputNumber
//                                 name = "PP_ED_V"
//                                 value={formik_preset.values.PP_ED_V}
//                                 onValueChange={formik_preset.handleChange}
//                                 showButtons
//                                 step={0.1}
//                                 maxFractionDigits={3}
//                             ></InputNumber>
//                         </div>
//                     </div>
//                 </div>
//                 </div>
//                 </BlockUI>
//             </div></div>
//         </Dialog>
//     );
//   });

//   export default PopipPreset;