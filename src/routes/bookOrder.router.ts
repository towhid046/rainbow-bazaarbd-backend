import express from 'express'
import { deleteBookOrderByIdController, estimateBookOrderCount, getAllBookOrderController, getBookOrderByIdController, postBookOrderController, putBookOrderByIdController } from '../controller/bookOrder.controller';

const bookOrderRouter = express.Router()

bookOrderRouter.post('/', postBookOrderController )
bookOrderRouter.get('/ordered-book-count', estimateBookOrderCount )
bookOrderRouter.get('/', getAllBookOrderController)
bookOrderRouter.get('/:id', getBookOrderByIdController)
bookOrderRouter.put('/:id', putBookOrderByIdController)
bookOrderRouter.delete('/:id', deleteBookOrderByIdController)

export default bookOrderRouter;

