-- AddIndex PontoTuristico
CREATE INDEX "PontoTuristico_cidadeId_idx" ON "PontoTuristico"("cidadeId");
CREATE INDEX "PontoTuristico_status_idx" ON "PontoTuristico"("status");
CREATE INDEX "PontoTuristico_ativo_idx" ON "PontoTuristico"("ativo");

-- AddIndex Evento
CREATE INDEX "Evento_cidadeId_idx" ON "Evento"("cidadeId");
CREATE INDEX "Evento_status_idx" ON "Evento"("status");
CREATE INDEX "Evento_ativo_idx" ON "Evento"("ativo");

-- AddIndex Comentario
CREATE INDEX "Comentario_userId_idx" ON "Comentario"("userId");
CREATE INDEX "Comentario_pontoTuristicoId_idx" ON "Comentario"("pontoTuristicoId");
CREATE INDEX "Comentario_eventoId_idx" ON "Comentario"("eventoId");
