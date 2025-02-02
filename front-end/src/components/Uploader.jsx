import { ChangeEvent, useState } from 'react'
import { Button, Typography, Box } from '@mui/material';
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadPhoto } from '../api/item/photo';
import { UploadImageApi } from '../api/item/UploadImageApi';

export const Uploader = () => {
    const [imageError, setImageError] = useState(false);
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: UploadImageApi,
        onSuccess: (response) => {
            // queryClient.invalidateQueries({queryKey:["photos"]})
            console.log(`UPLOADER RESP::$$`)
            console.log(response)
            setImageError(false)
        },
        onError: (error) => {
            console.log(error)
            setImageError(true)
        }
    })
    const uploadFile = (e) => {
        const files = e.target.files
        const file = e.target.files[0]
        const formData = new FormData();
        Object.values(files).forEach(file => {
            formData.append('file', file);
        });
        mutation.mutate(formData)
    }

    return (
        <>
            {imageError && (
                <>
                    <Box>
                        <Button className="aspect-ratio-container" variant="outlined-error" component="label" sx={{ height: 250, width: "100%" }}>

                            <img alt="tutorial"

                                src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png">

                            </img>


                            <input hidden accept="image/*" multiple type="file" onChange={uploadFile} />
                        </Button>
                        <Typography textAlign={"start"} fontSize={16} sx={{ color: "#d9534f", pl: 1 }}>Image is required</Typography>
                    </Box>
                </>

            )
            }
            {
                !imageError && (
                    <>
                        <Button className="aspect-ratio-container" variant="outlined-striped" component="label" sx={{ height: 250, width: "100%" }}>

                            <img alt="tutorial"

                                src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png">

                            </img>


                            <input hidden accept="image/*" multiple type="file" onChange={uploadFile} />
                        </Button>
                    </>
                )
            }

        </>
    )
}