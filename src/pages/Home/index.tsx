import { HandPalm, Play } from "@phosphor-icons/react";
import { HomeContainer, StartCountdownButton, StopCountdownButton } from "./styles";
import { createContext, useState } from "react";
import { NewCycleForm } from "./NewCycleForm";
import { CountDown } from "./Countdown";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from 'zod'
import { FormProvider, useForm } from "react-hook-form";

interface Cycle {
    id: string
    task: string
    minutesAmount: number
    startDate: Date
    interruptedDate?: Date
    finishedDate?: Date
}

interface CyclesContextType {
    activeCycle: Cycle | undefined;
    activeCycleId: string | null;
    amountSecondsPassed: number
    markCurrentCycleAsFinished: () => void
    setSecondsPassed: (seconds: number) => void
}

const newCycleFormValidationSchema = zod.object({
    task: zod.string().min(1, 'Informe a tarefa'),
    minutesAmount: zod.number().min(5,'O ciclo precisa ser maior que 5 minutos.').max(60, 'O ciclo precisa ser menor que 60 minutos.'),
})

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

export const CyclesContext = createContext({} as CyclesContextType)

export function Home() {
    const [cycles, setCycles] = useState<Cycle[]>([])
    const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
    const [amountSecondsPassed, setAmountSecondsPassed] = useState (0)

    const newCycleForm = useForm<NewCycleFormData>({
        resolver: zodResolver(newCycleFormValidationSchema),
        defaultValues: {
            task: '',
            minutesAmount: 0,
        }
    })

    const { handleSubmit, watch, reset } = newCycleForm

    const activeCycle  = cycles.find(cycle => cycle.id === activeCycleId)

    function markCurrentCycleAsFinished(){
        setCycles((state) =>
                        state.map((cycle) => {
                            if (cycle.id === activeCycleId){
                                return {...cycle, finishedDate: new Date()}
                            } else {
                                return cycle
                            }
                        }),
                    )
    }
    

    function setSecondsPassed(seconds: number){
        setAmountSecondsPassed(seconds)
    }

    function handleCreateNewCycle(data: NewCycleFormData){
        const newCycle: Cycle ={
            id: String(new Date().getTime()),
            task: data.task,
            minutesAmount: data.minutesAmount,
            startDate: new Date(),
        }

        setCycles((state) => [...state, newCycle]);
        setActiveCycleId(newCycle.id)
        setAmountSecondsPassed(0)

        reset();
    }

    function handleInterruptCycle() {        
        setCycles((state) => 
            state.map((cycle) => {
                if (cycle.id === activeCycleId){
                    return {...cycle, interruptedDate: new Date()}
                } else {
                    return cycle
                }
            }),
        )

        setActiveCycleId(null)
    }

    

    const task = watch('task')
    const isSubmitDisabled = !task;
    
    return (
        <HomeContainer>
            <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
                <CyclesContext.Provider value={{activeCycle, activeCycleId, amountSecondsPassed, setSecondsPassed, markCurrentCycleAsFinished}}>
                <FormProvider {...newCycleForm}>
                  <NewCycleForm/>
                </FormProvider>
                
                <CountDown/>
                </CyclesContext.Provider>

            { activeCycle ? (
                <StopCountdownButton onClick={handleInterruptCycle} type="button">
                <HandPalm size={24}/>
                Interromper
            </StopCountdownButton>
            ) : (<StartCountdownButton disabled={isSubmitDisabled} type="submit">
            <Play size={24}/>
            Começar
        </StartCountdownButton>) }
            </form>
        </HomeContainer>
    )
}