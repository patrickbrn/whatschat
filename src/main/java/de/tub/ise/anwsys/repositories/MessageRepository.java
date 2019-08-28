package de.tub.ise.anwsys.repositories;

import java.util.Date;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

import de.tub.ise.anwsys.model.Message;

public interface MessageRepository extends PagingAndSortingRepository<Message, Long> {

    Page<Message> findByChannelId(final long channelId, Pageable pageable);

    Page<Message> findByChannelIdAndDateGreaterThanEqual(final long channelId, final Date lastSeenTimestamp,
                                                         Pageable pageable);
}
